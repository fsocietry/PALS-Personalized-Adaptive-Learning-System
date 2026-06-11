const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

router.post("/login", verifyToken, authController.login);

module.exports = router;