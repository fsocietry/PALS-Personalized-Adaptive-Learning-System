// Import fungsi upsertUser dari SDK yang di-generate
const { upsertUser } = require("../src/dataconnect-admin-generated");

exports.login = async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    console.log("Menjalankan mutasi upsertUser ke SQL...");

    await upsertUser({
      id: uid,
      email: email,
      name: name || "PALS Student", 
      createdAt: new Date() // ✅ FIX: Ganti jadi objek Date murni agar lolos validasi Timestamp!
    });

    res.status(200).json({
      success: true,
      message: "Login berhasil dan data tersinkronisasi dengan SQL",
      user: { id: uid, email, name },
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