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

  const { meeting_length = 30, participants = [], meeting_cadence = "one_off" } = rulesResult || {};

  const styleGuidance = {
    brief: "Be concise and direct. Use bullet points. Get to the point quickly.",
    detailed: "Provide full context and background. Include comprehensive information.",
    directive: "Use clear, authoritative language. State expectations explicitly.",
    empathetic: "Use supportive, understanding tone. Acknowledge concerns.",
    executive: "Provide high-level summary. Focus on strategic implications.",
  }[communicationStyle] || styleGuidance.detailed;

  return `You are a communication expert helping executives create effective meeting agendas.

Generate a professional meeting agenda with the following requirements:
- Use sentence case throughout (no title case, no all caps)
- Do NOT use markdown formatting (no #, *, -, etc.)
- Write in plain text with clear line breaks
- Match the communication style: ${styleGuidance}

Meeting Details:
- Title: ${title || "Team Meeting"}
- Purpose: ${purpose || "Not specified"}
- Duration: ${meeting_length} minutes
- Cadence: ${meeting_cadence}
- Urgency: ${urgency}
- Complexity: ${complexity}
- Stakeholder Count: ${stakeholderCount}
- Decision Types: ${decisionTypes.join(", ") || "General discussion"}
${timeSensitivity ? `- Timeline: ${timeSensitivity}` : ""}
- Participants: ${participants.join(", ") || "Team members"}

Generate a time-blocked meeting agenda with:
1. Meeting title
2. Purpose statement (1-2 sentences)
3. Desired outcomes (3-5 bullet points)
4. Participants list with their roles/responsibilities
5. Agenda items with time allocations (time-blocked format)
6. Pre-work and materials section

Format the output as plain text with clear sections. Use line breaks to separate sections. Do not use markdown symbols.`;
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

Generate a ready-to-send email with the following requirements:
- Use sentence case throughout (no title case except for proper nouns)
- Do NOT use markdown formatting (no #, *, -, etc.)
- Write in plain text with clear paragraphs
- Match the communication style: ${styleGuidance}
- Include a clear subject line
- Include a greeting
- Provide context
- State the clear ask or purpose
- Include next steps

Email Details:
- Topic: ${title || "Update"}
- Purpose: ${purpose || "Not specified"}
- Urgency: ${urgency}
${timeSensitivity ? `- Timeline: ${timeSensitivity}` : ""}
${stakeholderGroups ? `- Stakeholder Groups: ${stakeholderGroups}` : ""}

Generate the email in this format:
Subject: [Clear, concise subject line]

[Greeting],

[Context paragraph explaining the situation]

[Main ask or purpose - what you need from recipients]

Next steps:
- [Action item 1]
- [Action item 2]
- [Action item 3]

[Closing],
[Your name]

Use plain text only. No markdown. Use line breaks for readability.`;
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

  return `You are a communication expert helping executives write async messages (Slack/Teams).

Generate a concise async message with the following requirements:
- Use sentence case throughout
- Do NOT use markdown formatting
- Keep it brief and scannable
- Use emoji sparingly and appropriately (1-2 max)
- Match the communication style: ${styleGuidance}

Message Details:
- Topic: ${title || "Update"}
- Purpose: ${purpose || "Not specified"}
- Urgency: ${urgency}
${timeSensitivity ? `- Timeline: ${timeSensitivity}` : ""}

Generate a Slack/Teams-style message that:
1. Starts with a brief context (1-2 sentences)
2. States the key point or ask clearly
3. Includes timeline if relevant
4. Ends with clear next steps or call to action

Format as plain text. Use line breaks for readability. Keep it under 150 words.`;
}

module.exports = {
  buildMeetingAgendaPrompt,
  buildEmailPrompt,
  buildAsyncMessagePrompt,
};
