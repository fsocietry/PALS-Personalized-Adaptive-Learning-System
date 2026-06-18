const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// Endpoint untuk mengambil profil dan statistik user: GET /api/user/stats
router.get("/stats", verifyToken, userController.getUserStats);

module.exports = router;