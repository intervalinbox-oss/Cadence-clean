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

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `log_${Date.now()}_backend_decisionData`,
        timestamp: Date.now(),
        location: "functions/src/saveDecision.js:beforeInputs",
        message: "Raw decisionData received by saveDecision",
        runId: "pre-fix",
        hypothesisId: "H1",
        data: {
          hasInputs: !!(decisionData && (decisionData.inputs || decisionData.input)),
          timeline: decisionData.timeline,
          time_sensitivity: decisionData.time_sensitivity,
          keys: Object.keys(decisionData || {}),
        },
      }),
    }).catch(() => {});
    // #endregion

    // Build inputs: prefer explicit inputs/input, else from top-level wizard fields (Quick Mode / Full Wizard)
    const explicitInputs = decisionData.inputs || decisionData.input;
    const rawInputs = explicitInputs && Object.keys(explicitInputs).length > 0
      ? explicitInputs
      : {
          title: decisionData.title ?? "",
          purpose: decisionData.purpose ?? "",
          urgency: decisionData.urgency,
          stakeholderCount: decisionData.stakeholderCount,
          sensitivity: decisionData.sensitivity,
          communicationStyle: decisionData.communicationStyle,
          emotionalRisk: decisionData.emotionalRisk,
          decisionTypes: decisionData.decisionTypes,
          // Prefer explicit timeline, then time_sensitivity from the wizard.
          timeline: decisionData.timeline ?? decisionData.time_sensitivity ?? "",
          complexity: decisionData.complexity,
          stakeholders: decisionData.stakeholders,
        };

    // Strip out any undefined values so Firestore never receives them (including inputs.timeline).
    const inputs = Object.entries(rawInputs).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {});

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `log_${Date.now()}_backend_inputs`,
        timestamp: Date.now(),
        location: "functions/src/saveDecision.js:afterInputs",
        message: "Derived inputs before Firestore write",
        runId: "pre-fix",
        hypothesisId: "H1",
        data: {
          usingExplicitInputs: !!(explicitInputs && Object.keys(explicitInputs).length > 0),
          inputsTimeline: inputs.timeline,
          inputsTimeSensitivity: inputs.time_sensitivity,
          inputKeys: Object.keys(inputs || {}),
        },
      }),
    }).catch(() => {});
    // #endregion

    // Prepare document matching spec schema
    const docData = {
      uid,
      timestamp: Date.now(),
      communicationType: decisionData.communicationType || decisionData.recommendation || "unknown",
      urgency: decisionData.urgency || "none",
      tone: decisionData.tone || decisionData.communicationStyle || "",
      sensitivity: decisionData.sensitivity || decisionData.emotionalRisk || "none",
      timeSavedMinutes: timeSavedMinutes || decisionData.timeSavedMinutes || 0,
      inputs,
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
