const express = require('express');
const router = express.Router();

const { getUserProfile } = require('../controllers/userController'); 
const authMiddleware = require('../middleware/authMiddleware');

// Baris 8 lo yang memicu eror:
router.get('/profile', authMiddleware, getUserProfile); 

module.exports = router;