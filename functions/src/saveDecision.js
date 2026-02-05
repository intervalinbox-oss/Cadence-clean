const admin = require("firebase-admin");

/**
 * Save decision to Firestore
 * POST /api/save
 * Body: { decisionData, timeSavedMinutes }
 */
async function saveDecision(req, res) {
  try {
    const { decisionData, timeSavedMinutes } = req.body;
    const uid = req.user.uid;

    if (!decisionData) {
      return res.status(400).json({ error: "Missing decisionData" });
    }

    // Prepare document matching spec schema
    const docData = {
      uid,
      timestamp: Date.now(),
      communicationType: decisionData.communicationType || decisionData.recommendation || "unknown",
      urgency: decisionData.urgency || "none",
      tone: decisionData.tone || decisionData.communicationStyle || "",
      sensitivity: decisionData.sensitivity || decisionData.emotionalRisk || "none",
      timeSavedMinutes: timeSavedMinutes || decisionData.timeSavedMinutes || 0,
      inputs: decisionData.inputs || decisionData.input || {},
      outputs: {
        email: decisionData.outputs?.email || decisionData.generatedEmail || "",
        agenda: decisionData.outputs?.agenda || decisionData.generatedAgenda || "",
        recommendations: decisionData.outputs?.recommendations || decisionData.rulesResult || {},
      },
      metadata: decisionData.metadata || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await admin.firestore().collection("decisions").add(docData);

    res.json({
      success: true,
      id: ref.id,
    });
  } catch (error) {
    console.error("Save decision error:", error);
    res.status(500).json({
      error: "Failed to save decision",
      message: error.message,
    });
  }
}

module.exports = { saveDecision };
