/**
 * Prompt templates for Claude 3 content generation
 * All prompts enforce sentence case and no markdown formatting
 */

function buildMeetingAgendaPrompt(inputs, rulesResult) {
  const {
    title = "",
    purpose = "",
    urgency = "medium",
    complexity = "moderate",
    stakeholderCount = "3-5",
    decisionTypes = [],
    communicationStyle = "detailed",
    timeSensitivity = "",
  } = inputs;

  const { meeting_length = 30, participants = [], meeting_cadence = "One-time meeting (no regular cadence)" } = rulesResult || {};

  const styleMap = {
    brief: "Be concise. Use bullets. Get to the point quickly.",
    detailed: "Full context and background. Be thorough.",
    directive: "Clear, authoritative. State expectations explicitly.",
    empathetic: "Supportive tone. Acknowledge concerns.",
    executive: "High-level summary. Strategic implications.",
  };
  const styleGuidance = styleMap[communicationStyle] || styleMap.detailed;

  return `Create a plain text meeting agenda. Sentence case, no markdown. Style: ${styleGuidance}

Details: title: ${title || "Team Meeting"} | purpose: ${purpose || "Not specified"} | duration: ${meeting_length} min | cadence: ${meeting_cadence} | urgency: ${urgency} | complexity: ${complexity} | stakeholders: ${stakeholderCount} | decision types: ${decisionTypes.join(", ") || "General discussion"}${timeSensitivity ? ` | timeline: ${timeSensitivity}` : ""} | participants: ${participants.join(", ") || "Team members"}

Output structure: (1) meeting title (2) 1–2 sentence purpose (3) 3–5 desired outcomes (4) participants with roles (5) agenda items with time blocks totaling ${meeting_length} min (6) pre-work/materials.`;
}

function buildEmailPrompt(inputs, rulesResult) {
  const {
    title = "",
    purpose = "",
    urgency = "medium",
    communicationStyle = "detailed",
    timeSensitivity = "",
    stakeholderGroups = "",
  } = inputs;

  const styleGuidance = {
    brief: "Be concise. Get to the point in the first paragraph. Use short sentences.",
    detailed: "Provide full context. Explain background and reasoning. Be thorough.",
    directive: "Use clear, direct language. State what needs to happen. Be authoritative.",
    empathetic: "Use warm, supportive tone. Acknowledge challenges. Be understanding.",
    executive: "Lead with key points. Provide high-level summary. Focus on impact.",
  }[communicationStyle] || styleGuidance.detailed;

  return `You are a communication expert helping executives write professional emails.

Write a ready-to-send plain text email. Use sentence case, no markdown symbols, and match this style: ${styleGuidance}

Email details:
- topic: ${title || "Update"}
- purpose: ${purpose || "Not specified"}
- urgency: ${urgency}
${timeSensitivity ? `- timeline: ${timeSensitivity}` : ""}
${stakeholderGroups ? `- stakeholder groups: ${stakeholderGroups}` : ""}

Follow this structure:
- clear, concise subject line
- short greeting
- 1–2 short paragraphs of context
- one paragraph stating the main ask or decision needed
- a short \"Next steps\" list with 2–4 action items
- brief closing and sender name`;
}

function buildAsyncMessagePrompt(inputs, rulesResult) {
  const {
    title = "",
    purpose = "",
    urgency = "low",
    communicationStyle = "brief",
    timeSensitivity = "",
  } = inputs;

  const styleGuidance = {
    brief: "Be very concise. Use short sentences. Get to the point immediately.",
    detailed: "Provide context but keep it concise for async format.",
    directive: "Be direct and clear. State what needs to happen.",
    empathetic: "Be supportive but concise. Acknowledge briefly.",
    executive: "High-level summary. Key points only.",
  }[communicationStyle] || styleGuidance.brief;

  return `You are a communication expert helping executives write async messages (Slack or Teams).

Write a concise, plain text message. Use sentence case, no markdown, and keep it brief and scannable. Match this style: ${styleGuidance}

Message details:
- topic: ${title || "Update"}
- purpose: ${purpose || "Not specified"}
- urgency: ${urgency}
${timeSensitivity ? `- timeline: ${timeSensitivity}` : ""}

Structure:
- 1–2 sentences of context
- one sentence stating the key point or ask
- mention timing or deadline if relevant
- 2–3 short bullet-like lines for next steps or actions
Keep the whole message under 150 words.`;
}

module.exports = {
  buildMeetingAgendaPrompt,
  buildEmailPrompt,
  buildAsyncMessagePrompt,
};
