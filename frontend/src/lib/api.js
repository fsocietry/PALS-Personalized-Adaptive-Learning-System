// ============================================================================
// ─── PRODUCTION PIPELINE: PREPROCESSING & POST INFRASTRUCTURE ───────────────
// ============================================================================

import { auth } from '../firebase';

const HF_API_URL = "https://maisorpt-pals-model-api.hf.space/predict";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLwiIOsrpRRe-KbYK2Hku2p5hci3D8ZNNtKRRYKtlSNwzx8CGQ4tmBeDAMd5rglyaB7A/exec";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const TENSE_TOPICS = [
  "Simple Present Tense", "Present Continuous Tense", "Present Perfect Tense", "Present Perfect Continuous Tense",
  "Simple Past Tense", "Past Continuous Tense", "Past Perfect Tense", "Past Perfect Continuous Tense",
  "Simple Future Tense", "Future Continuous Tense", "Future Perfect Tense", "Future Perfect Continuous Tense"
];

export function preprocessTelemetryForML(records) {
  const topics = {};

  records.forEach((row) => {
    if (!row.topic) return;
    const cleanTopic = row.topic.replace(/\s+/g, ' ').trim();
    if (!topics[cleanTopic]) topics[cleanTopic] = [];
    topics[cleanTopic].push(row);
  });

  return Object.keys(topics).map((topicName) => {
    const group = topics[topicName];
    const totalQuestions = group.length;

    let sumCorrect = 0;
    let sumHint = 0;
    let sumOverthink = 0;
    let sumTime = 0;
    let sumConf = 0;

    group.forEach((row) => {
      sumCorrect += row['summary.final_is_correct'] || 0;
      sumHint += (row['summary.max_hint_unlocked'] > 0) ? 1 : 0;
      
      const isOverthinking = (row['summary.total_answer_changes'] > 1 || 
                              row['summary.struggle_indicators.changed_mind_after_correct'] === true);
      sumOverthink += isOverthinking ? 1 : 0;
      
      sumTime += row['summary.final_is_ideal_duration'] ? 1 : 0;

      // 🎯 FIXED: Pemetaan SAKLEK sesuai notebook ML lo (Yakin = 2)
      const rawConf = String(row['summary.final_confidence']).toLowerCase().trim();
      let mlConfValue = 2; // Default Yakin (2)
      
      if (rawConf.includes('ragu')) mlConfValue = 1;
      else if (rawConf.includes('tidak') || rawConf.includes('no')) mlConfValue = 0;
      else if (rawConf.includes('yakin') || rawConf.includes('yes')) mlConfValue = 2;

      sumConf += mlConfValue;
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

export async function sendToHuggingFace(preprocessedPayloads) {
  console.log("🚀 Executing Hugging Face Inference Engine...", preprocessedPayloads);
  
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
      console.error(`🛑 Inference failure on node ${item.topic}:`, err);
      return { topic: item.topic, success: false, error: err.message };
    }
  });
  return Promise.all(promises);
}

export async function saveQuizToBackend(payload) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User session expired");

    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/api/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed synchronization with backend SQL connect node");
    }

    return await response.json();
  } catch (error) {
    console.error("🛑 Synchronization node failure:", error);
    throw error;
  }
}

export async function fetchUserProfileFromPostgres(email) {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    
    const response = await fetch(`${API_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("🛑 Critical profiling node error:", err);
    return null;
  }
}

export async function fetchQuizHistoryFromPostgres() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ [api.js] fetchQuizHistory skipped: No authenticated Firebase user found.");
      return [];
    }
    const token = await user.getIdToken();

    console.log("📡 [api.js] Shooting API request to:", `${API_URL}/api/quiz/history`);
    const response = await fetch(`${API_URL}/api/quiz/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 🎯 BONGKAR TOPENG EROR: Tampilkan status HTTP asli dari backend Node.js lo!
    if (!response.ok) {
      const errorResponseText = await response.text();
      console.error(`🛑 [api.js] Backend REJECTED request! Status: ${response.status} (${response.statusText})`);
      console.error(`🛑 [api.js] Backend Error Message Content:`, errorResponseText);
      return [];
    }

    const data = await response.json();
    console.log("🍏 [api.js] Successfully received data array from PostgreSQL:", data);
    return data;
  } catch (err) {
    console.error("🛑 [api.js] Network/Operational crash inside fetchQuizHistoryFromPostgres:", err);
    return [];
  }
}

export function computeStats(history) {
  const historyArray = Array.isArray(history) ? history : [];
  const quizzesTaken = historyArray.length;
  const avgScore = quizzesTaken
    ? Math.round(historyArray.reduce((s, h) => s + (h.score || 0), 0) / quizzesTaken)
    : 0;
    
  return { quizzesTaken, avgScore, streakDays: computeStreak(historyArray) };
}

export function computeStreak(history) {
  if (!history || !history.length) return 0;
  
  const days = [...new Set(history.map((h) => {
    if (h.date) return h.date;
    if (h.createdAt) return h.createdAt.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  }))].sort().reverse();
  
  let streak = 1;
  let prev = new Date(days[0]);
  
  for (let i = 1; i < days.length; i++) {
    const cur = new Date(days[i]);
    const diff = Math.round((prev - cur) / 86400000);
    if (diff === 1) { streak++; prev = cur; }
    else if (diff === 0) continue;
    else break;
  }
  return streak;
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