// Import fungsi mutasi dari SDK Data Connect
const { 
  insertQuizAttempt, 
  insertPrediction, 
  insertLearningPath,
  insertTopicProfile 
} = require("../src/dataconnect-admin-generated");

exports.submitQuiz = async (req, res) => {
  try {
    // 1. Ambil User ID dari token yang sudah divalidasi middleware
    const userId = req.user.uid;

    // 2. Ambil data kuis dan hasil ML dari request frontend
    const { 
      topicIndex, 
      score, 
      totalQuestion, 
      correctAnswer, 
      difficulty,
      predictedLevel,
      confidence,
      nextTopic
    } = req.body;

    const timestamp = new Date().toISOString();

    // 3. Masukkan data ke tabel QuizAttempt
    await insertQuizAttempt({
      userId,
      topicIndex,
      score,
      totalQuestion,
      correctAnswer,
      difficulty,
      createdAt: timestamp
    });

    // 4. Masukkan data hasil analisis ML ke tabel Prediction
    await insertPrediction({
      userId,
      topicIndex,
      predictedLevel,
      confidence,
      updatedAt: timestamp
    });

    // 5. Update Learning Path user untuk topik selanjutnya
    await insertLearningPath({
      userId,
      currentTopic: topicIndex,
      recommendedDifficulty: predictedLevel,
      nextTopic,
      updatedAt: timestamp
    });

    // ─── TAMBAHAN 2: SIMPAN KE TOPIC PROFILE ───
    
    // Siapkan nilai default -1 (Belum Dikerjakan) untuk semua 12 topik
    const profileData = {
      topic1: -1, topic2: -1, topic3: -1, topic4: -1,
      topic5: -1, topic6: -1, topic7: -1, topic8: -1,
      topic9: -1, topic10: -1, topic11: -1, topic12: -1,
    };

    // Dinamis: Timpa nilai -1 menjadi level dari AI HANYA pada topik yang sedang dikerjakan
    const currentTopicKey = `topic${topicIndex}`;
    if (profileData.hasOwnProperty(currentTopicKey)) {
      profileData[currentTopicKey] = predictedLevel;
    }

    // 6. Masukkan data ke tabel TopicProfile
    await insertTopicProfile({
      userId,
      ...profileData,
      updatedAt: timestamp
    });

    // ─── BATAS TAMBAHAN ───

    res.status(200).json({
      success: true,
      message: "Data kuis dan prediksi ML berhasil disimpan ke SQL Connect!",
    });

  } catch (error) {
    console.error("🛑 Gagal menyimpan data kuis:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data kuis",
      error: error.message,
    });
  }
};