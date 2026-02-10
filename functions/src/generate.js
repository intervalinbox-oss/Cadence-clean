const { Anthropic } = require("@anthropic-ai/sdk");
const {
  buildMeetingAgendaPrompt,
  buildEmailPrompt,
  buildAsyncMessagePrompt,
} = require("./prompts");

// Claude client will be initialized with API key from process.env.CLAUDE_API_KEY
// (set by Firebase Functions v2 secrets in index.js)
let client = null;

function getClaudeClient() {
  if (!client) {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY secret not configured");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Generate communication content based on recommendation type
 * POST /api/generate
 * Body: { inputs, rulesResult }
 */
async function generateCadence(req, res) {
  try {
    const { inputs, rulesResult } = req.body;

    if (!inputs || !rulesResult) {
      return res.status(400).json({
        error: "Missing required fields: inputs and rulesResult",
      });
    }

    const { recommendation } = rulesResult;

    if (!recommendation) {
      return res.status(400).json({
        error: "Missing recommendation in rulesResult",
      });
    }

    let prompt = "";
    let contentField = "";

    // Determine which content to generate based on recommendation
    if (recommendation === "meeting") {
      prompt = buildMeetingAgendaPrompt(inputs, rulesResult);
      contentField = "meetingAgenda";
    } else if (recommendation === "email") {
      prompt = buildEmailPrompt(inputs, rulesResult);
      contentField = "emailDraft";
    } else if (recommendation === "async_message") {
      prompt = buildAsyncMessagePrompt(inputs, rulesResult);
      contentField = "asyncMessage";
    } else {
      // For cancel_meeting or no_action, return empty content
      return res.json({
        output: {
          recommendation,
          [contentField]: "",
          message: "No content generation needed for this recommendation type.",
        },
      });
    }

    // Call Claude API (model override via CLAUDE_MODEL env; keep max_tokens modest for latency)
    const modelId = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";
    const claudeClient = getClaudeClient();
    const startMs = Date.now();
    const result = await claudeClient.messages.create({
      model: modelId,
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const latencyMs = Date.now() - startMs;
    console.log("generateCadence Claude latency_ms", latencyMs);

    const generatedText = result.content[0].text || "";

    // Clean up the text (remove any markdown that might have slipped through)
    const cleanedText = generatedText
      .replace(/#{1,6}\s+/g, "") // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/^[-*]\s+/gm, "") // Remove list markers at start of lines
      .trim();

    // Return structured response
    res.json({
      output: {
        recommendation,
        [contentField]: cleanedText,
      },
    });
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(500).json({
      error: "Failed to generate content",
      message: error.message,
    });
  }
}

module.exports = { generateCadence };
