const { getAuth } = require("firebase-admin/auth");
require("../config/firebase");

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
      });
    }

    const decoded = await getAuth().verifyIdToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Token tidak valid",
    });
  }
};

module.exports = verifyToken;