const path = require("path");
const fs = require("fs");

let admin = null;
let firebaseAuth = null;

try {
  admin = require("firebase-admin");
} catch (err) {
  console.error("❌ Failed to require firebase-admin:", err.message);
}

if (admin) {
  const serviceAccountPath = path.resolve(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json"
  );

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn("⚠️  Firebase service account file not found:", serviceAccountPath);
  } else {
    try {
      const serviceAccount = require(serviceAccountPath);

      // v13+ modular imports
      const { initializeApp, cert, getApps } = require("firebase-admin/app");
      const { getAuth } = require("firebase-admin/auth");

      if (!getApps() || getApps().length === 0) {
        initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        console.log("✅ Firebase Admin initialized");
        console.log("   Project ID:", serviceAccount.project_id);
      } else {
        console.log("✅ Firebase Admin already initialized");
      }

      firebaseAuth = getAuth();
    } catch (err) {
      console.error("❌ Failed to initialize Firebase Admin:", err.message);
    }
  }
}

module.exports = { admin, firebaseAuth };