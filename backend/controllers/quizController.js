const { 
  insertQuizAttempt, 
  upsertPrediction, 
  upsertLearningPath,
  upsertTopicProfile,
  getUserProfile,
  getQuizAttempts 
} = require("../src/dataconnect-admin-generated");

const TENSE_TOPICS = [
  "Simple Present Tense", "Present Continuous Tense", "Present Perfect Tense", "Present Perfect Continuous Tense",
  "Simple Past Tense", "Past Continuous Tense", "Past Perfect Tense", "Past Perfect Continuous Tense",
  "Simple Future Tense", "Future Continuous Tense", "Future Perfect Tense", "Future Perfect Continuous Tense"
];

const DIFFICULTY_MAP = { easy: 1, medium: 2, hard: 3, mixed: 0 };

exports.submitQuiz = async (req, res) => {
  console.log("📥 Incoming Quiz Payload received at endpoint:", JSON.stringify(req.body));
  
  try {
    const userId = req.user.uid;
    const { isDiagnostic } = req.body;

    if (isDiagnostic) {
      console.log("🎯 Processing Resilient BULK DIAGNOSTIC Matrix Insertion...");
      const { questions, answers, aiResults } = req.body;

      let profileData = {
        topic1: -1, topic2: -1, topic3: -1, topic4: -1,
        topic5: -1, topic6: -1, topic7: -1, topic8: -1,
        topic9: -1, topic10: -1, topic11: -1, topic12: -1,
      };

      for (let i = 0; i < TENSE_TOPICS.length; i++) {
        const currentTense = TENSE_TOPICS[i];
        const topicIndex = i + 1;

        const tenseQuestionIndices = [];
        questions.forEach((q, qIdx) => {
          if (q.category === currentTense) {
            tenseQuestionIndices.push(qIdx);
          }
        });

        if (tenseQuestionIndices.length === 0) continue;

        let correctAnswerCount = 0;
        let totalQuestionCount = tenseQuestionIndices.length;

        tenseQuestionIndices.forEach((qIdx) => {
          if (answers[qIdx] === questions[qIdx].answer) {
            correctAnswerCount++;
          }
        });

        const computedScore = Math.round((correctAnswerCount / totalQuestionCount) * 100);
        const matchingAi = aiResults ? aiResults.find(r => r.topic === currentTense) : null;
        const predictedLevel = matchingAi ? (matchingAi.predicted_cluster ?? matchingAi.prediction ?? 2) : 2;

        let aiConfidence = 0.85;
        if (matchingAi && matchingAi.probability && matchingAi.prediction !== undefined) {
          aiConfidence = parseFloat(matchingAi.probability[matchingAi.prediction]) || 0.85;
        }

        let finalPrediction = Number(predictedLevel);
        if (correctAnswerCount === 0) finalPrediction = 2;

        await insertQuizAttempt({
          userId,
          topicIndex,
          score: parseFloat(computedScore), 
          totalQuestion: totalQuestionCount,
          correctAnswer: correctAnswerCount,
          difficulty: 0, 
          createdAt: new Date()
        });

        await upsertPrediction({
          userId,
          topicIndex,
          predictedLevel: finalPrediction,
          confidence: parseFloat(aiConfidence),
          updatedAt: new Date()
        });

        profileData[`topic${topicIndex}`] = finalPrediction;
      }

      await upsertTopicProfile({
        userId,
        ...profileData,
        updatedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: "Diagnostic profile matrix initialized successfully in SQL database!",
      });
    } 
    
    else {
      console.log("📚 Processing SINGLE SUBJECT PRACTICE Node Insertion...");
      const { 
        topicIndex, score, totalQuestion, correctAnswer, 
        difficulty, predictedLevel, confidence, nextTopic
      } = req.body;

      const diffInt = DIFFICULTY_MAP[String(difficulty).toLowerCase()] || 2;

      await insertQuizAttempt({
        userId,
        topicIndex: Number(topicIndex),
        score: parseFloat(score),
        totalQuestion: Number(totalQuestion),
        correctAnswer: Number(correctAnswer),
        difficulty: diffInt, 
        createdAt: new Date()
      });

      await upsertPrediction({
        userId,
        topicIndex: Number(topicIndex),
        predictedLevel: Number(predictedLevel),
        confidence: parseFloat(confidence) || 0.85,
        updatedAt: new Date()
      });

      await upsertLearningPath({
        userId,
        currentTopic: Number(topicIndex),
        recommendedDifficulty: Number(predictedLevel),
        nextTopic: Number(nextTopic) || (Number(topicIndex) + 1),
        updatedAt: new Date()
      });

      const existingProfileResult = await getUserProfile({ userId });
      const existingProfile = existingProfileResult.data?.topicProfile || {};

      let profileData = {
        topic1: existingProfile.topic1 ?? 2,
        topic2: existingProfile.topic2 ?? 2,
        topic3: existingProfile.topic3 ?? 2,
        topic4: existingProfile.topic4 ?? 2,
        topic5: existingProfile.topic5 ?? 2,
        topic6: existingProfile.topic6 ?? 2,
        topic7: existingProfile.topic7 ?? 2,
        topic8: existingProfile.topic8 ?? 2,
        topic9: existingProfile.topic9 ?? 2,
        topic10: existingProfile.topic10 ?? 2,
        topic11: existingProfile.topic11 ?? 2,
        topic12: existingProfile.topic12 ?? 2,
      };

      profileData[`topic${topicIndex}`] = Number(predictedLevel);

      await upsertTopicProfile({
        userId,
        ...profileData,
        updatedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: "Practice quiz node synchronized with SQL database successfully without overwriting other nodes!",
      });
    }
  } catch (error) {
    console.error("🛑 CRITICAL BACKEND EXCEPTION ENCOUNTERED:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data kuis",
      error: error.message,
    });
  }
};

exports.getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log("📜 [Backend] Mengambil riwayat kuis riil untuk userId:", userId);

    // Fetch relational database entries through generated Admin SDK handler
    const queryResult = await getQuizAttempts({ userId });
    const dbHistory = queryResult.data?.quizAttempts || queryResult.data?.quizAttemptsList || [];

    console.log(`🍏 [Backend] Sukses menemukan ${dbHistory.length} entri kuis untuk user ini.`);
    
    return res.status(200).json(dbHistory);
  } catch (error) {
    console.error("🛑 [Backend] Gagal mengambil riwayat kuis dari PostgreSQL:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat kuis dari server",
      error: error.message
    });
  }
};