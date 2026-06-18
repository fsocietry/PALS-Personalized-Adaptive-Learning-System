const express = require("express");
const router = express.Router();

// Import middleware auth agar hanya user yang login yang bisa kirim nilai
const verifyToken = require("../middleware/authMiddleware");
const quizController = require("../controllers/quizController");

// Endpoint untuk menerima submit kuis: POST /api/quiz/submit
router.post("/submit", verifyToken, quizController.submitQuiz);

module.exports = router;