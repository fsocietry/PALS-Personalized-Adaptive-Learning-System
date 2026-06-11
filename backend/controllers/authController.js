exports.login = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};