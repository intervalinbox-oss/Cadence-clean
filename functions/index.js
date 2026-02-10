const { onRequest } = require("firebase-functions/v2/https");
const { api } = require("./src/api");

// Force deploy: auth via X-Internal-Secret + X-Verified-Uid (v6)
// Firebase Functions v2 automatically makes secrets available via process.env
// Set secret with: firebase functions:secrets:set CLAUDE_API_KEY
exports.api = onRequest(
  {
    cors: true,
    region: "us-central1",
    timeoutSeconds: 120,
    secrets: ["CLAUDE_API_KEY", "INTERNAL_API_SECRET"],
  },
  api
);
