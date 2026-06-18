const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Import controller lo
const authMiddleware = require('../middleware/authMiddleware'); // Middleware verifikasi token

// URL: /api/user/profile
router.get('/profile', authMiddleware, userController.getUserProfile);

module.exports = router;