const { initializeApp, cert } = require("firebase-admin/app");

// In production (e.g. Render) the service account is provided as a JSON string
// in the FIREBASE_SERVICE_ACCOUNT env var. Locally we fall back to the
// git-ignored serviceAccountKey.json file.
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  return require("./serviceAccountKey.json");
}

initializeApp({
  credential: cert(loadServiceAccount()),
});
