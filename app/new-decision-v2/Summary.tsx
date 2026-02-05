"use client";

import React, { useMemo, useState, useEffect } from "react";
import RulesEngine from "@/app/lib/RulesEngine";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { generateContent, saveDecision } from "@/app/lib/api";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";
import Textarea from "@/app/components/ui/Textarea";

type SummaryProps = {
  data: any;
  onBack: () => void;
};

export default function Summary({ data, onBack }: SummaryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    meetingAgenda?: string;
    emailDraft?: string;
    asyncMessage?: string;
  }>({});
  const [editingContent, setEditingContent] = useState<{
    type: "agenda" | "email" | "message" | null;
    content: string;
  }>({ type: null, content: "" });

  const rulesResult = useMemo(() => {
    try {
      return new RulesEngine().run(data || {});
    } catch (err) {
      console.error("RulesEngine error", err);
      return null;
    }
  }, [data]);

  // Generate content when component mounts
  useEffect(() => {
    if (rulesResult && user) {
      generateContentAsync();
    }
  }, [rulesResult, user]);

  async function generateContentAsync() {
    if (!rulesResult || !user) return;
    
    setGenerating(true);
    try {
      const result = await generateContent(data, rulesResult);
      setGeneratedContent({
        meetingAgenda: result.output.meetingAgenda || "",
        emailDraft: result.output.emailDraft || "",
        asyncMessage: result.output.asyncMessage || "",
      });
    } catch (error) {
      console.error("Failed to generate content:", error);
      // Continue without generated content
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (saving || !user || !rulesResult) return;

    setSaving(true);
    try {
      const decisionData = {
        ...data,
        recommendation: rulesResult.recommendation,
        confidence_score: rulesResult.confidence_score,
        rationale: rulesResult.rationale,
        meeting_length: rulesResult.meeting_length,
        meeting_cadence: rulesResult.meeting_cadence,
        participants: rulesResult.participants,
        communicationType: rulesResult.recommendation,
        urgency: data.urgency || "none",
        tone: data.communicationStyle || "",
        sensitivity: data.emotionalRisk || "none",
        outputs: {
          email: generatedContent.emailDraft || "",
          agenda: generatedContent.meetingAgenda || "",
          recommendations: rulesResult,
        },
      };

      const result = await saveDecision(decisionData, rulesResult.time_saved_minutes || 0);
      router.push(`/decision/${result.id}`);
    } catch (err) {
      console.error("Failed to save decision", err);
      alert("Failed to save decision. Please try again.");
      setSaving(false);
    }
  }

  function getRecommendationDisplay() {
    if (!rulesResult) return null;

    const rec = rulesResult.recommendation;
    const displays: Record<string, { label: string; icon: string; description: string }> = {
      meeting: {
        label: "Schedule a Meeting",
        icon: "💻",
        description: "Critical decisions are best made synchronously.",
      },
      email: {
        label: "Send an Email",
        icon: "✉️",
        description: "Timeline allows for thoughtful written response.",
      },
      async_message: {
        label: "Send Async Message",
        icon: "💬",
        description: "Quick updates don't need synchronous communication.",
      },
      cancel_meeting: {
        label: "Cancel This Meeting",
        icon: "❌",
        description: "This meeting is unnecessary based on your inputs.",
      },
      no_action: {
        label: "No Action Needed",
        icon: "✓",
        description: "This doesn't require formal communication.",
      },
    };

    return displays[rec] || displays.meeting;
  }

  if (!data || !rulesResult) {
    return (
      <Card size="large">
        <p className="text-foreground-muted">No data available.</p>
        <Button variant="tertiary" onClick={onBack} className="mt-4">
          ← Back
        </Button>
      </Card>
    );
  }

  const display = getRecommendationDisplay();
  const bpList = rulesResult.best_practices
    ?.split(".")
    .map((s: string) => s.trim())
    .filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Find your Cadence
        </h1>
        <p className="text-lg text-foreground-muted">
          Answer a few questions and we&apos;ll recommend the best communication method, plus generate tailored content for you.
        </p>
      </div>

      {/* Recommendation Card */}
      <Card size="large" className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{display?.icon}</div>
            <div>
              <div className="text-xs uppercase tracking-wide text-foreground-muted mb-1">
                CADENCE RECOMMENDS
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                {display?.label}
              </h2>
              <p className="text-foreground-muted mt-1">{display?.description}</p>
            </div>
          </div>
          <Badge variant="success" className="text-sm">
            {rulesResult.confidence_score}% confidence
          </Badge>
        </div>
      </Card>

      {/* Time Saved Banner */}
      {rulesResult.time_saved_minutes > 0 && (
        <Card size="medium" className="bg-success/10 border-success/20">
          <div className="flex items-center gap-4">
            <div className="text-3xl">⏱️</div>
            <div>
              <div className="text-sm text-foreground-muted">Time Saved</div>
              <div className="text-2xl font-bold text-success">
                {rulesResult.time_saved_minutes} minutes
              </div>
              <div className="text-sm text-foreground-muted mt-1">
                By choosing the right communication channel
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Why Cadence Chose This */}
      <Card size="large">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✨</span>
          <h3 className="text-xl font-semibold text-foreground">Why Cadence chose this</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Urgency:</strong> {data.urgency || "Not specified"}</div>
          <div><strong>Stakeholders:</strong> {data.stakeholderCount || "Not specified"}</div>
          <div><strong>Complexity:</strong> {data.complexity || "Not specified"}</div>
          <div><strong>Timeline:</strong> {data.time_sensitivity || "Not specified"}</div>
          <div><strong>Sensitivity:</strong> {data.emotionalRisk || "Not specified"}</div>
          <div><strong>Change impact:</strong> {data.changeImpact || "Not specified"}</div>
        </div>
      </Card>

      {/* Meeting Metadata (if meeting) */}
      {rulesResult.recommendation === "meeting" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>⏰</span>
              <div className="text-sm font-medium text-foreground-muted">Duration</div>
            </div>
            <div className="text-lg font-bold text-foreground">
              {rulesResult.meeting_length || 30}-{rulesResult.meeting_length ? rulesResult.meeting_length + 15 : 45} minutes
            </div>
          </Card>
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>📅</span>
              <div className="text-sm font-medium text-foreground-muted">Cadence</div>
            </div>
            <div className="text-lg font-bold text-foreground">
              {rulesResult.meeting_cadence === "one_off" ? "One-time" : rulesResult.meeting_cadence}
            </div>
          </Card>
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>👥</span>
              <div className="text-sm font-medium text-foreground-muted">Participants</div>
            </div>
            <div className="text-sm font-medium text-foreground">
              {rulesResult.participants?.length || 0} recommended
            </div>
          </Card>
        </div>
      )}

      {/* Generated Content */}
      {generating ? (
        <Card size="large">
          <div className="text-center py-8">
            <div className="text-foreground-muted">Generating content...</div>
          </div>
        </Card>
      ) : (
        <>
          {/* Meeting Agenda */}
          {rulesResult.recommendation === "meeting" && generatedContent.meetingAgenda && (
            <Card size="large">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your meeting agenda</h3>
                  <p className="text-sm text-foreground-muted">Ready to copy into your calendar or send to participants</p>
                </div>
                <div className="flex gap-2">
                  <Button size="small" variant="secondary" onClick={() => {
                    navigator.clipboard.writeText(generatedContent.meetingAgenda || "");
                  }}>
                    Copy
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => {
                    setEditingContent({ type: "agenda", content: generatedContent.meetingAgenda || "" });
                  }}>
                    Edit
                  </Button>
                  <Button size="small" variant="primary" onClick={generateContentAsync}>
                    Regenerate
                  </Button>
                </div>
              </div>
              {editingContent.type === "agenda" ? (
                <div className="space-y-4">
                  <Textarea
                    value={editingContent.content}
                    onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                    rows={12}
                  />
                  <div className="flex gap-2">
                    <Button size="small" onClick={() => {
                      setGeneratedContent({ ...generatedContent, meetingAgenda: editingContent.content });
                      setEditingContent({ type: null, content: "" });
                    }}>
                      Save
                    </Button>
                    <Button size="small" variant="tertiary" onClick={() => setEditingContent({ type: null, content: "" })}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-surface p-4 rounded border border-border">
                  {generatedContent.meetingAgenda}
                </div>
              )}
            </Card>
          )}

          {/* Email Draft */}
          {rulesResult.recommendation === "email" && generatedContent.emailDraft && (
            <Card size="large">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your draft email</h3>
                  <p className="text-sm text-foreground-muted">Ready to copy, customize, and send</p>
                </div>
                <div className="flex gap-2">
                  <Button size="small" variant="secondary" onClick={() => {
                    navigator.clipboard.writeText(generatedContent.emailDraft || "");
                  }}>
                    Copy
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => {
                    setEditingContent({ type: "email", content: generatedContent.emailDraft || "" });
                  }}>
                    Edit
                  </Button>
                  <Button size="small" variant="primary" onClick={generateContentAsync}>
                    Regenerate
                  </Button>
                </div>
              </div>
              {editingContent.type === "email" ? (
                <div className="space-y-4">
                  <Textarea
                    value={editingContent.content}
                    onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                    rows={12}
                  />
                  <div className="flex gap-2">
                    <Button size="small" onClick={() => {
                      setGeneratedContent({ ...generatedContent, emailDraft: editingContent.content });
                      setEditingContent({ type: null, content: "" });
                    }}>
                      Save
                    </Button>
                    <Button size="small" variant="tertiary" onClick={() => setEditingContent({ type: null, content: "" })}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-surface p-4 rounded border border-border">
                  {generatedContent.emailDraft}
                </div>
              )}
            </Card>
          )}

          {/* Async Message */}
          {rulesResult.recommendation === "async_message" && generatedContent.asyncMessage && (
            <Card size="large">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your async message</h3>
                  <p className="text-sm text-foreground-muted">Ready to copy and paste into Slack or Teams</p>
                </div>
                <div className="flex gap-2">
                  <Button size="small" variant="secondary" onClick={() => {
                    navigator.clipboard.writeText(generatedContent.asyncMessage || "");
                  }}>
                    Copy
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => {
                    setEditingContent({ type: "message", content: generatedContent.asyncMessage || "" });
                  }}>
                    Edit
                  </Button>
                  <Button size="small" variant="primary" onClick={generateContentAsync}>
                    Regenerate
                  </Button>
                </div>
              </div>
              {editingContent.type === "message" ? (
                <div className="space-y-4">
                  <Textarea
                    value={editingContent.content}
                    onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                    rows={8}
                  />
                  <div className="flex gap-2">
                    <Button size="small" onClick={() => {
                      setGeneratedContent({ ...generatedContent, asyncMessage: editingContent.content });
                      setEditingContent({ type: null, content: "" });
                    }}>
                      Save
                    </Button>
                    <Button size="small" variant="tertiary" onClick={() => setEditingContent({ type: null, content: "" })}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-surface p-4 rounded border border-border">
                  {generatedContent.asyncMessage}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Best Practices */}
      {bpList.length > 0 && (
        <Card size="large">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <h3 className="text-xl font-semibold text-foreground">Best practices for success</h3>
          </div>
          <ul className="space-y-2 list-disc list-inside text-foreground-muted">
            {bpList.map((bp: string, i: number) => (
              <li key={i}>{bp}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="tertiary" onClick={onBack} disabled={saving}>
          ← Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !user}
        >
          {saving ? "Saving…" : "✓ Save to History"}
        </Button>
      </div>
    </div>
  );
}
