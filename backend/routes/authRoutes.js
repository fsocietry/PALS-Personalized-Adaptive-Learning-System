const express = require("express");
const router = express.Router();

// 1. Import controller auth
const authController = require("../controllers/authController");

// 2. Import middleware token (Pastikan path ke folder middleware lo sudah benar)
const verifyToken = require("../middleware/authMiddleware");

// 🎯 BARIS 7: Pastikan panggilannya utuh seperti ini, bro!
router.post("/login", verifyToken, authController.login);

module.exports = router;