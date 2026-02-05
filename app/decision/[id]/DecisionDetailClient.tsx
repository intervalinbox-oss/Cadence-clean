"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Textarea from "@/app/components/ui/Textarea";
import Link from "next/link";

export default function DecisionDetailClient({ id }: { id?: string }) {
  const [decision, setDecision] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<{
    type: "agenda" | "email" | "message" | null;
    content: string;
  }>({ type: null, content: "" });

  useEffect(() => {
    if (!id) {
      setError("No decision id provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    getDoc(doc(db, "decisions", id))
      .then((snap) => {
        if (!snap.exists()) {
          setError("Decision not found");
        } else {
          setDecision({ id: snap.id, ...snap.data() });
        }
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-foreground-muted">Loading decision...</p>
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card size="large">
          <p className="text-error">{error || "Decision not found"}</p>
          <Link href="/history">
            <Button variant="tertiary" className="mt-4">
              ← Back to History
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const rulesResult = decision.outputs?.recommendations || decision.rulesResult || {};
  const recommendation = decision.communicationType || rulesResult.recommendation || "unknown";
  const title = decision.inputs?.title || decision.input?.title || "Untitled Decision";
  const purpose = decision.inputs?.purpose || decision.input?.purpose || "";
  const generatedAgenda = decision.outputs?.agenda || "";
  const generatedEmail = decision.outputs?.email || "";

  const getRecommendationDisplay = () => {
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
    };
    return displays[recommendation] || displays.meeting;
  };

  const display = getRecommendationDisplay();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-foreground-muted">{formatDate(decision.timestamp || decision.createdAt)}</p>
        </div>
        <Link href="/history">
          <Button variant="tertiary">← Back to History</Button>
        </Link>
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
              <h2 className="text-3xl font-bold text-foreground">{display?.label}</h2>
              <p className="text-foreground-muted mt-1">{display?.description}</p>
            </div>
          </div>
          {rulesResult.confidence_score && (
            <Badge variant="success" className="text-sm">
              {rulesResult.confidence_score}% confidence
            </Badge>
          )}
        </div>
      </Card>

      {/* Purpose */}
      {purpose && (
        <Card size="medium">
          <h3 className="text-lg font-semibold text-foreground mb-2">Purpose</h3>
          <p className="text-foreground-muted">{purpose}</p>
        </Card>
      )}

      {/* Key Factors */}
      <Card size="large">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✨</span>
          <h3 className="text-xl font-semibold text-foreground">Why Cadence chose this</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Urgency:</strong> {decision.urgency || "Not specified"}</div>
          <div><strong>Stakeholders:</strong> {decision.inputs?.stakeholderCount || "Not specified"}</div>
          <div><strong>Complexity:</strong> {decision.inputs?.complexity || "Not specified"}</div>
          <div><strong>Timeline:</strong> {decision.inputs?.time_sensitivity || "Not specified"}</div>
          <div><strong>Sensitivity:</strong> {decision.sensitivity || decision.inputs?.emotionalRisk || "Not specified"}</div>
          <div><strong>Change impact:</strong> {decision.inputs?.changeImpact || "Not specified"}</div>
        </div>
      </Card>

      {/* Meeting Metadata (if meeting) */}
      {recommendation === "meeting" && rulesResult.meeting_length && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>⏰</span>
              <div className="text-sm font-medium text-foreground-muted">Duration</div>
            </div>
            <div className="text-lg font-bold text-foreground">
              {rulesResult.meeting_length}-{rulesResult.meeting_length + 15} minutes
            </div>
          </Card>
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>📅</span>
              <div className="text-sm font-medium text-foreground-muted">Cadence</div>
            </div>
            <div className="text-lg font-bold text-foreground capitalize">
              {rulesResult.meeting_cadence || "One-time"}
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
      {recommendation === "meeting" && generatedAgenda && (
        <Card size="large">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Your meeting agenda</h3>
              <p className="text-sm text-foreground-muted">Ready to copy into your calendar or send to participants</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(generatedAgenda)}
              >
                Copy
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setEditingContent({ type: "agenda", content: generatedAgenda })}
              >
                Edit
              </Button>
            </div>
          </div>
          {editingContent.type === "agenda" ? (
            <div className="space-y-4">
              <Textarea value={editingContent.content} onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })} rows={12} />
              <div className="flex gap-2">
                <Button size="small" onClick={() => setEditingContent({ type: null, content: "" })}>
                  Done
                </Button>
                <Button size="small" variant="tertiary" onClick={() => setEditingContent({ type: null, content: "" })}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-surface p-4 rounded border border-border">
              {generatedAgenda}
            </div>
          )}
        </Card>
      )}

      {recommendation === "email" && generatedEmail && (
        <Card size="large">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Your draft email</h3>
              <p className="text-sm text-foreground-muted">Ready to copy, customize, and send</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(generatedEmail)}
              >
                Copy
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setEditingContent({ type: "email", content: generatedEmail })}
              >
                Edit
              </Button>
            </div>
          </div>
          {editingContent.type === "email" ? (
            <div className="space-y-4">
              <Textarea value={editingContent.content} onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })} rows={12} />
              <div className="flex gap-2">
                <Button size="small" onClick={() => setEditingContent({ type: null, content: "" })}>
                  Done
                </Button>
                <Button size="small" variant="tertiary" onClick={() => setEditingContent({ type: null, content: "" })}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-surface p-4 rounded border border-border">
              {generatedEmail}
            </div>
          )}
        </Card>
      )}

      {/* Best Practices */}
      {rulesResult.best_practices && (
        <Card size="large">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <h3 className="text-xl font-semibold text-foreground">Best practices for success</h3>
          </div>
          <div className="prose prose-sm max-w-none text-foreground-muted">
            {rulesResult.best_practices}
          </div>
        </Card>
      )}

      {/* Time Saved */}
      {decision.timeSavedMinutes > 0 && (
        <Card size="medium" className="bg-success/10 border-success/20">
          <div className="flex items-center gap-4">
            <div className="text-3xl">⏱️</div>
            <div>
              <div className="text-sm text-foreground-muted">Time Saved</div>
              <div className="text-2xl font-bold text-success">
                {decision.timeSavedMinutes} minutes
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
