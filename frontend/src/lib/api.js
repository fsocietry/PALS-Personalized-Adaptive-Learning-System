// ============================================================================
// ─── PRODUCTION PIPELINE: PREPROCESSING & POST INFRASTRUCTURE ───────────────
// ============================================================================

import { auth } from '../firebase'; // <--- TAMBAHAN: Import Firebase Auth

const HF_API_URL = "https://maisorpt-pals-model-api.hf.space/predict";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLwiIOsrpRRe-KbYK2Hku2p5hci3D8ZNNtKRRYKtlSNwzx8CGQ4tmBeDAMd5rglyaB7A/exec";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // <--- TAMBAHAN: URL Backend Node.js

/**
 * 1. PREPROCESSING: Mengambil output flat dari telemetry.js, mengelompokkannya per topik,
 * dan menghitung rata-rata nilai fitur (mean) untuk disuapi ke Hugging Face.
 * @param {Array} records - Hasil return array mentah dari fungsi finalize() di telemetry.js
 */
export function preprocessTelemetryForML(records) {
  const topics = {};

  // Kelompokkan baris pengerjaan berdasarkan nama topik
  records.forEach((row) => {
    if (!row.topic) return;
    const cleanTopic = row.topic.replace(/\s+/g, ' ').trim();
    if (!topics[cleanTopic]) topics[cleanTopic] = [];
    topics[cleanTopic].push(row);
  });

  // Iterasi setiap grup topik untuk menghitung rasio/rata-rata (mean)
  return Object.keys(topics).map((topicName) => {
    const group = topics[topicName];
    const totalQuestions = group.length;

    let sumCorrect = 0;
    let sumHint = 0;
    let sumOverthink = 0;
    let sumTime = 0;
    let sumConf = 0;

    group.forEach((row) => {
      // Mengakses field menggunakan penamaan flat string sesuai output telemetry.js produksi
      sumCorrect += row['summary.final_is_correct'] || 0;
      sumHint += (row['summary.max_hint_unlocked'] > 0) ? 1 : 0;
      
      // Indikator Overthinking (Total ganti jawaban > 1 ATAU ganti pikiran setelah sempat benar)
      const isOverthinking = (row['summary.total_answer_changes'] > 1 || 
                              row['summary.struggle_indicators.changed_mind_after_correct'] === true);
      sumOverthink += isOverthinking ? 1 : 0;
      
      sumTime += row['summary.final_is_ideal_duration'] ? 1 : 0;

      // Konversi teks tingkat keyakinan (confidence) menjadi skor ordinal numerik (0, 1, 2)
      const confMap = { 'tidak tahu': 0, 'ragu-ragu': 1, 'yakin': 2 };
      sumConf += confMap[row['summary.final_confidence']] ?? 2;
    });

    return {
      topic: topicName,
      payload: {
        acc_topik: parseFloat((sumCorrect / totalQuestions).toFixed(4)),
        hint_topik: parseFloat((sumHint / totalQuestions).toFixed(4)),
        overthink_topik: parseFloat((sumOverthink / totalQuestions).toFixed(4)),
        time_topik: parseFloat((sumTime / totalQuestions).toFixed(4)),
        conf_topik: parseFloat((sumConf / totalQuestions).toFixed(4))
      }
    };
  });
}

/**
 * 2. POST KE HUGGING FACE API: Mengeksekusi request prediksi per topik secara paralel
 */
export async function sendToHuggingFace(preprocessedPayloads) {
  console.log("🚀 Menembak Hugging Face API...", preprocessedPayloads);
  
  const promises = preprocessedPayloads.map(async (item) => {
    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload)
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      return { topic: item.topic, success: true, ...data };
    } catch (err) {
      console.error(`🛑 Gagal melakukan inference untuk topik ${item.topic}:`, err);
      return { topic: item.topic, success: false, error: err.message };
    }
  });
  return Promise.all(promises);
}

/**
 * 3. POST KE GOOGLE DRIVE: Mengirimkan payload kompilasi data ke Google Apps Script
 */
export async function sendToGoogleDrive(globalSessionId, records) {
  console.log("💾 Mengirim kompilasi data mentah ke Google Sheets...");
  
  // Rekonstruksi struktur payload bersarang agar sesuai dengan kebutuhan Apps Script Data Collector lama
  const summaries = records.map(row => ({
    question_id: row.question_id,
    topic: row.topic,
    difficulty: row.difficulty,
    summary: {
      total_duration_sec: row['summary.total_duration_sec'],
      visit_count: row['summary.visit_count'],
      final_is_correct: row['summary.final_is_correct'],
      final_is_ideal_duration: row['summary.final_is_ideal_duration'],
      max_hint_unlocked: row['summary.max_hint_unlocked'],
      total_hint_read_sec: row['summary.total_hint_read_sec'],
      first_confidence: row['summary.first_confidence'],
      final_confidence: row['summary.final_confidence'],
      total_answer_changes: row['summary.total_answer_changes'],
      struggle_indicators: {
        ever_selected_correct_answer: row['summary.struggle_indicators.ever_selected_correct_answer'],
        changed_mind_after_correct: row['summary.struggle_indicators.changed_mind_after_correct']
      },
      focus_loss_total: row['summary.focus_loss_total']
    }
  }));

  // AMAN: Kita oper records mentah ke field session agar folder session di Drive tidak kosong
  const payload = {
    sessionId: globalSessionId,
    summary: summaries,
    session: records 
  };

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      redirect: "follow", 
      headers: {
        "Content-Type": "text/plain;charset=utf-8" 
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("🛑 Gagal menyimpan data ke Google Drive Sheets:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. POST KE DATABASE SQL (BACKEND PALS): Menyimpan hasil kuis dan prediksi model AI
 * TAMBAHAN BARU
 */
export async function saveQuizToBackend(payload) {
  try {
    // 1. Pastikan user sedang login
    const user = auth.currentUser;
    if (!user) throw new Error("User tidak ditemukan (belum login)");

    // 2. Dapatkan token yang valid
    const token = await user.getIdToken();

    // 3. Kirim POST request ke backend Node.js
    const response = await fetch(`${API_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Masukkan token di sini
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Gagal menyimpan ke backend");
    }

    return await response.json();
  } catch (error) {
    console.error("🛑 Error di saveQuizToBackend:", error);
    throw error;
  }
}