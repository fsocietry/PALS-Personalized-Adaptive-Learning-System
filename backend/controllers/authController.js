// Import fungsi upsertUser dari SDK yang baru saja di-generate
const { upsertUser } = require("../src/dataconnect-admin-generated");

exports.login = async (req, res) => {
  try {
    // req.user didapat dari authMiddleware.js setelah token Firebase divalidasi
    // Kita ekstrak uid (sebagai id), email, dan name
    const { uid, email, name } = req.user;

    // Menjalankan mutasi ke Firebase Data Connect (SQL)
    await upsertUser({
      id: uid,
      email: email,
      name: name || "PALS Student", // Fallback jika nama kosong
      createdAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: "Login berhasil dan data tersinkronisasi dengan SQL",
      user: {
        id: uid,
        email: email,
        name: name
      },
    });
  } catch (error) {
    console.error("🛑 Gagal menyimpan ke DB SQL:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat sinkronisasi data user",
      error: error.message,
    });
  }
};