const { onRequest } = require("firebase-functions/v2/https");
const { api } = require("./src/api");

// Firebase Functions v2 automatically makes secrets available via process.env
// Set secret with: firebase functions:secrets:set CLAUDE_API_KEY
exports.api = onRequest(
  {
    cors: true,
    region: "us-central1",
    secrets: ["CLAUDE_API_KEY"], // Secret name, automatically available in process.env
  },
  api
);
