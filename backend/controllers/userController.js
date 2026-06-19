const { getUserProfile } = require("../src/dataconnect-admin-generated");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log("🔍 [Backend] Mencari profil kognitif untuk userId:", userId);

    const queryResult = await getUserProfile({ userId });
    
    console.log("📦 [Backend] queryResult Mentah dari SQL:", JSON.stringify(queryResult));

    let profile = null;
    if (queryResult) {
      profile = queryResult.data?.topicProfile || queryResult.topicProfile || queryResult.data;
    }

    console.log("🧠 [Backend] Hasil ekstraksi akhir profil:", profile);

    return res.status(200).json({
      success: true,
      topicProfile: profile || null 
    });

  } catch (error) {
    console.error("🛑 [Backend] Crash saat membaca tabel TopicProfile:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Gagal memproses profil kognitif di database SQL",
      error: error.message 
    });
  }}