const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { verifyAuth } = require("./authMiddleware");

// Initialize Firebase Admin if not already initialized (projectId ensures token verification uses same project as client)
if (!admin.apps.length) {
  admin.initializeApp(
    process.env.GCLOUD_PROJECT
      ? { projectId: process.env.GCLOUD_PROJECT }
      : undefined
  );
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Import route handlers
const { generateCadence } = require("./generate");
const { saveDecision } = require("./saveDecision");
const { getDashboard, getDashboardInsights, getStreaks } = require("./dashboard");

// Router: all API routes (so we can mount at both "" and "/api" for path compatibility)
const apiRouter = express.Router();

// Health check (no auth required)
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.post("/generate", verifyAuth, generateCadence);
apiRouter.post("/save", verifyAuth, saveDecision);
apiRouter.get("/dashboard", verifyAuth, getDashboard);
apiRouter.post("/dashboard", verifyAuth, getDashboard);
apiRouter.get("/dashboard/insights", verifyAuth, getDashboardInsights);
apiRouter.post("/dashboard/insights", verifyAuth, getDashboardInsights);
apiRouter.get("/dashboard/streaks", verifyAuth, getStreaks);

// Mount at /api (client calls .../api/dashboard) and at / (in case path is passed as /dashboard)
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Export Express app for Firebase Functions
module.exports = { api: app };
