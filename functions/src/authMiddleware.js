const admin = require("firebase-admin");

/**
 * Middleware to verify Firebase Auth JWT token
 * Expects Authorization header: "Bearer <token>"
 */
async function verifyAuth(req, res, next) {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const verifiedUid = req.headers["x-verified-uid"];
  if (internalSecret && verifiedUid && req.headers["x-internal-secret"] === internalSecret) {
    req.user = { uid: verifiedUid };
    return next();
  }

  let token =
    (req.body && req.body.firebase_id_token && String(req.body.firebase_id_token).trim()) ||
    "";
  if (!token && req.query && req.query.firebase_id_token) {
    token = String(req.query.firebase_id_token).trim();
  }
  if (!token) {
    const authHeader = req.headers.authorization || req.headers["x-firebase-id-token"] || "";
    token = authHeader.replace(/^Bearer\s+/i, "").trim();
  }
  if (!token && req.headers["x-firebase-id-token"]) {
    token = String(req.headers["x-firebase-id-token"]).trim();
  }

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth verification error:", error.code || error.message, error);
    const message =
      error.code === "auth/id-token-expired"
        ? "Token expired"
        : error.code === "auth/argument-error"
          ? "Invalid token"
          : "Unauthorized";
    return res.status(401).json({ error: message });
  }
}

module.exports = { verifyAuth };
