"use client";

import React, { useState } from "react";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/app/lib/firebase";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Textarea from "@/app/components/ui/Textarea";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function FeedbackPage() {
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !suggestion.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, "suggestions"), {
        uid: user.uid,
        email: user.email || "",
        suggestion: suggestion.trim(),
        createdAt: serverTimestamp(),
      });
      setSuggestion("");
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit suggestion:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Suggest An Improvement
          </h1>
          <p className="text-foreground-muted">
            We’d love to hear how we can make Cadence better. Share an idea, report a pain point, or suggest a feature.
          </p>
        </div>

        {submitted ? (
          <Card size="large">
            <p className="text-foreground mb-4">
              Thanks for your suggestion. We’ll review it and use it to prioritize what we build next.
            </p>
            <Button
              variant="secondary"
              onClick={() => setSubmitted(false)}
            >
              Send another suggestion
            </Button>
          </Card>
        ) : (
          <Card size="large">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="w-full">
                <Textarea
                  label="Your suggestion:"
                  placeholder="e.g. Add a way to save draft decisions, or suggest a different question for Quick Mode..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={5}
                  required
                  id="feedback-suggestion"
                  maxLength={1000}
                />
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-sm text-foreground-muted">Be as specific as you like. Every idea helps.</p>
                  <p className="text-sm text-foreground-muted tabular-nums" aria-live="polite">
                    {suggestion.length} / 1000
                  </p>
                </div>
              </div>
              {error && (
                <p className="text-sm text-error" role="alert">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting || !suggestion.trim()}
                >
                  {submitting ? "Sending…" : "Submit Suggestion"}
                </Button>
                <Link href="/" className="text-sm text-foreground-muted hover:text-foreground">
                  Cancel
                </Link>
              </div>
            </form>
          </Card>
        )}

        <p className="mt-6 text-sm text-foreground-muted">
          Back to <Link href="/" className="text-accent-blue hover:underline">Home</Link> or{" "}
          <Link href="/dashboard" className="text-accent-blue hover:underline">Dashboard</Link>.
        </p>
      </div>
    </ProtectedRoute>
  );
}
