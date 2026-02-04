"use client";

import React, { useMemo, useState, useEffect } from "react";
import RulesEngine from "@/app/lib/RulesEngine";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { generateContent, saveDecision } from "@/app/lib/api";
import { generateICSFile, downloadICS, openGoogleCalendar } from "@/app/lib/calendarUtils";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";
import Textarea from "@/app/components/ui/Textarea";
import { useToast } from "@/app/components/ui/Toast";

type SummaryProps = {
  data: any;
  onBack: () => void;
};

export default function Summary({ data, onBack }: SummaryProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [weeklyMetrics, setWeeklyMetrics] = useState<{
    decisionsThisWeek: number;
    timeSavedThisWeek: number;
    decisionsLastWeek: number;
    timeSavedLastWeek: number;
    efficiencyTrend: "up" | "down" | "stable";
  } | null>(null);

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

  // Fetch weekly metrics after decision is saved or when component loads
  useEffect(() => {
    if (user && rulesResult) {
      fetchWeeklyMetrics();
    }
  }, [user, rulesResult]);

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

  async function fetchWeeklyMetrics() {
    if (!user) return;
    try {
      const { apiRequest } = await import("@/app/lib/api");
      const dashboardData = await apiRequest<{ weeklyMetrics?: {
        decisionsThisWeek: number;
        timeSavedThisWeek: number;
        decisionsLastWeek: number;
        timeSavedLastWeek: number;
        efficiencyTrend: "up" | "down" | "stable";
      } }>("/dashboard");
      setWeeklyMetrics(dashboardData.weeklyMetrics || null);
    } catch (error) {
      console.error("Failed to fetch weekly metrics:", error);
    }
  }

  async function handleSave() {
    if (saving || !user || !rulesResult) return;

    setSaving(true);
    setSaveError(null);
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
      showToast("Decision saved successfully!");
      // Brief delay to show success message before redirect
      setTimeout(() => {
        router.push(`/decision/${result.id}`);
      }, 1000);
    } catch (err) {
      console.error("Failed to save decision", err);
      setSaveError("Failed to save decision. Please try again.");
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
          Answer a few questions and we&apos;ll recommend whether to schedule a meeting, send an email, or use async communication — then we&apos;ll compose the email or craft the meeting agenda for you.
        </p>
      </div>

      {/* Recommendation Card */}
      <Card size="large" className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{display?.icon}</div>
            <div>
              <div className="text-xs tracking-widest text-foreground-muted mb-1 font-semibold">
                Cadence Recommends
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
                {(() => {
                  const hours = Math.round(rulesResult.time_saved_minutes / 60);
                  if (hours >= 8) return "That's a full work day!";
                  if (hours >= 4) return "That's half a work day";
                  if (hours >= 1) return `That's ${hours} hour${hours > 1 ? "s" : ""} of focused work`;
                  return "Quick wins add up";
                })()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Momentum (instant feedback) */}
      {user && rulesResult.time_saved_minutes > 0 && weeklyMetrics && (
        <Card size="medium" className="bg-accent-blue/5 border-accent-blue/20">
          <div className="flex items-center gap-4">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground-muted mb-1">
                Your impact this week
              </div>
              <div className="text-xl font-bold text-foreground">
                {weeklyMetrics.decisionsThisWeek} decisions • {Math.round(weeklyMetrics.timeSavedThisWeek / 60)}h saved
              </div>
              {/* Velocity badge */}
              {weeklyMetrics.decisionsThisWeek >= 5 && (
                <div className="text-xs text-success mt-1 font-medium">High velocity</div>
              )}
              {weeklyMetrics.decisionsThisWeek >= 3 && weeklyMetrics.decisionsThisWeek < 5 && (
                <div className="text-xs text-accent-blue mt-1 font-medium">Steady pace</div>
              )}
              {weeklyMetrics.decisionsThisWeek >= 1 && weeklyMetrics.decisionsThisWeek < 3 && (
                <div className="text-xs text-warning mt-1 font-medium">Building momentum</div>
              )}
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-blue border-t-transparent mb-4"></div>
            <div className="text-foreground font-medium mb-1">
              {rulesResult.recommendation === "meeting" && "Crafting your meeting agenda..."}
              {rulesResult.recommendation === "email" && "Composing your email draft..."}
              {rulesResult.recommendation === "async_message" && "Writing your async message..."}
              {!["meeting", "email", "async_message"].includes(rulesResult.recommendation) && "Generating content..."}
            </div>
            <div className="text-sm text-foreground-muted">This usually takes a few seconds</div>
          </div>
        </Card>
      ) : (
        <>
          {/* Meeting Agenda */}
          {rulesResult.recommendation === "meeting" && generatedContent.meetingAgenda && (
            <Card size="large">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your meeting agenda</h3>
                  <p className="text-sm text-foreground-muted">We&apos;ve crafted a complete agenda for you. Ready to copy into your calendar or send to participants.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Primary actions - always visible */}
                  <Button size="small" variant="secondary" onClick={async () => {
                    await navigator.clipboard.writeText(generatedContent.meetingAgenda || "");
                    showToast("Copied to clipboard!");
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
                  
                  {/* More actions dropdown for mobile */}
                  <div className="relative md:hidden">
                    <Button 
                      size="small" 
                      variant="secondary" 
                      onClick={() => setShowMoreActions(!showMoreActions)}
                    >
                      More
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                    {showMoreActions && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                            onClick={async () => {
                              const fullText = `${data.title || 'Meeting'}\n\n${data.purpose || ''}\n\n${generatedContent.meetingAgenda || ""}`;
                              await navigator.clipboard.writeText(fullText);
                              showToast("Copied to clipboard!");
                              setShowMoreActions(false);
                            }}
                          >
                            Copy All
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                            onClick={() => {
                              const icsContent = generateICSFile({
                                title: data.title || "Meeting",
                                description: `${data.purpose || ''}\n\n${generatedContent.meetingAgenda || ""}`,
                                duration: rulesResult.meeting_length || 30,
                              });
                              const filename = `${(data.title || "meeting").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
                              downloadICS(icsContent, filename);
                              setShowMoreActions(false);
                            }}
                          >
                            Add to Calendar
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                            onClick={() => {
                              openGoogleCalendar({
                                title: data.title || "Meeting",
                                description: `${data.purpose || ''}\n\n${generatedContent.meetingAgenda || ""}`,
                                duration: rulesResult.meeting_length || 30,
                              });
                              setShowMoreActions(false);
                            }}
                          >
                            Open in Google Calendar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Secondary actions - visible on desktop */}
                  <div className="hidden md:flex gap-2">
                    <Button size="small" variant="secondary" onClick={async () => {
                      const fullText = `${data.title || 'Meeting'}\n\n${data.purpose || ''}\n\n${generatedContent.meetingAgenda || ""}`;
                      await navigator.clipboard.writeText(fullText);
                      showToast("Copied to clipboard!");
                    }}>
                      Copy All
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => {
                      const icsContent = generateICSFile({
                        title: data.title || "Meeting",
                        description: `${data.purpose || ''}\n\n${generatedContent.meetingAgenda || ""}`,
                        duration: rulesResult.meeting_length || 30,
                      });
                      const filename = `${(data.title || "meeting").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
                      downloadICS(icsContent, filename);
                    }}>
                      Add to Calendar
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => {
                      openGoogleCalendar({
                        title: data.title || "Meeting",
                        description: `${data.purpose || ''}\n\n${generatedContent.meetingAgenda || ""}`,
                        duration: rulesResult.meeting_length || 30,
                      });
                    }}>
                      Open in Google Calendar
                    </Button>
                  </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your draft email</h3>
                  <p className="text-sm text-foreground-muted">We&apos;ve composed a complete email for you. Ready to copy, customize, and send.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="small" variant="secondary" onClick={async () => {
                    await navigator.clipboard.writeText(generatedContent.emailDraft || "");
                    showToast("Copied to clipboard!");
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your async message</h3>
                  <p className="text-sm text-foreground-muted">We&apos;ve crafted a message for you. Ready to copy and paste into Slack or Teams.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="small" variant="secondary" onClick={async () => {
                    await navigator.clipboard.writeText(generatedContent.asyncMessage || "");
                    showToast("Copied to clipboard!");
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

      {/* Save Error */}
      {saveError && (
        <Card size="medium" className="bg-error/10 border-error/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-error mb-1">{saveError}</p>
              <Button
                size="small"
                variant="secondary"
                onClick={handleSave}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
        <Button variant="tertiary" onClick={onBack} disabled={saving} className="w-full sm:w-auto">
          ← Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !user}
          className="w-full sm:w-auto"
        >
          {saving ? "Saving…" : "✓ Save to History"}
        </Button>
      </div>

      {/* Toast Notification */}
      {ToastComponent}
    </div>
  );
}
