const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");

router.post("/login", verifyToken, authController.login);

module.exports = router;