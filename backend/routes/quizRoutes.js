const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

// 📝 Rute untuk simpan kuis
router.post('/submit', authMiddleware, quizController.submitQuiz);

// 📜 FIX: Tambahkan baris ini agar rute history kuis lo aktif!
router.get('/history', authMiddleware, quizController.getQuizHistory); 

module.exports = router;