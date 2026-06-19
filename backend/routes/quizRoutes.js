const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/submit', authMiddleware, quizController.submitQuiz);

router.get('/history', authMiddleware, quizController.getQuizHistory); 

module.exports = router;