// Sesuaikan import ini dengan file generated Firebase Data Connect kamu
const { listQuizAttemptsByUser } = require("../src/dataconnect-admin-generated");

exports.getUserStats = async (req, res) => {
  try {
    // UID didapatkan dari token Firebase yang sudah di-verify oleh middleware
    const userId = req.user.uid; 

    // Ambil semua riwayat kuis user dari database SQL
    const response = await listQuizAttemptsByUser({ userId: userId });
    
    // Pastikan kita menangkap array-nya dengan aman
    const attempts = response.data.quizAttempts || [];

    // ─── 1. CEK STATUS DIAGNOSTIK ───
    // Ingat trik kita? Diagnostic kuis memakai topicIndex: 0
    const diagnosticAttempt = attempts.find(a => a.topicIndex === 0);
    const hasDoneDiagnostic = !!diagnosticAttempt;

    // ─── 2. HITUNG STATISTIK PRACTICE (Dashboard) ───
    // Kita hanya menghitung skor untuk kuis biasa (topicIndex > 0)
    const practiceAttempts = attempts.filter(a => a.topicIndex > 0);
    const quizzesTaken = practiceAttempts.length;

    let averageScore = 0;
    if (quizzesTaken > 0) {
      const totalScore = practiceAttempts.reduce((sum, a) => sum + a.score, 0);
      averageScore = Math.round(totalScore / quizzesTaken);
    }

    // ─── 3. HITUNG STREAK (Hari beruntun) ───
    let streak = 0;
    
    if (practiceAttempts.length > 0) {
      // Ekstrak tanggal saja (YYYY-MM-DD) dan hilangkan duplikat hari yang sama
      const uniqueDates = [...new Set(practiceAttempts.map(a => {
        const date = new Date(a.createdAt);
        return date.toISOString().split('T')[0];
      }))].sort((a, b) => new Date(b) - new Date(a)); // Urutkan dari terbaru ke terlama

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Mulai hitung streak jika aktivitas terakhir adalah hari ini atau kemarin
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const expectedPrevDate = new Date(new Date(uniqueDates[i-1]) - 86400000).toISOString().split('T')[0];
          if (uniqueDates[i] === expectedPrevDate) {
            streak++;
          } else {
            break; // Putus streak jika bolong
          }
        }
      }
    }

    // ─── 4. KIRIM DATA KE FRONTEND ───
    res.status(200).json({
      hasDoneDiagnostic,
      stats: {
        averageScore,
        quizzesTaken,
        streak
      }
    });

  } catch (error) {
    console.error("🛑 Gagal mengambil statistik user:", error);
    res.status(500).json({ message: "Gagal mengambil data statistik", error: error.message });
  }
};