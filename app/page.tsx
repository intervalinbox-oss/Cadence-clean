"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState } from "react";
import { apiRequest } from "@/app/lib/api";

const SECTION_SPACING = "py-14 sm:py-16";
const CONTAINER_PADDING = "px-4 sm:px-6 lg:px-8";
const CONTAINER_MAX = "max-w-4xl mx-auto";

function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ChartIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
    </svg>
  );
}

function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function VideoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function EnvelopeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ChatIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [impact, setImpact] = useState<{ timeSavedMinutes: number; meetingsAvoided: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    apiRequest("/dashboard")
      .then((d: any) => {
        const timeSaved = d?.timeSavedTotal ?? 0;
        const breakdown = d?.communicationBreakdown ?? {};
        const meetingsAvoided = breakdown.cancel_meeting ?? 0;
        setImpact({ timeSavedMinutes: timeSaved, meetingsAvoided });
      })
      .catch(() => setImpact(null));
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className={`${CONTAINER_MAX} ${CONTAINER_PADDING} ${SECTION_SPACING} text-center`}>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 mb-8">
            <SparkleIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Communication Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5">
            Cadence: Know When to Meet, Message, or Email
          </h1>
          <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto mb-8">
            Clear recommendations, optimized meetings, and ready-to-use drafts—plus .ics to add meetings to your calendar in one click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/new-decision-v2"
              className="inline-flex items-center gap-2 rounded-lg gradient-accent text-white font-medium px-6 py-3 hover:opacity-90 transition-opacity"
            >
              <SparkleIcon className="w-4 h-4" />
              Find Your Cadence
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg gradient-accent text-white font-medium px-6 py-3 hover:opacity-90 transition-opacity"
            >
              <ChartIcon className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>
          <div className="max-w-md mx-auto rounded-2xl bg-surface border border-border p-5 text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <ClockIcon className="w-5 h-5 text-success" />
                Your Impact
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success text-white text-xs font-medium px-2.5 py-1">
                <SparkleIcon className="w-3 h-3" />
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {impact
                    ? impact.timeSavedMinutes >= 60
                      ? `${Math.floor(impact.timeSavedMinutes / 60)}h ${impact.timeSavedMinutes % 60}m`
                      : `${impact.timeSavedMinutes}m`
                    : "30m"}
                </div>
                <div className="text-sm text-foreground-muted">Saved this month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{impact ? impact.meetingsAvoided : "2"}</div>
                <div className="text-sm text-foreground-muted">Meetings avoided</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features: 3 cards */}
        <section className={`max-w-5xl mx-auto ${CONTAINER_PADDING} ${SECTION_SPACING}`}>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-xl bg-surface border border-border p-5 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <VideoIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1.5">Smart Meeting Recommendations</h2>
              <p className="text-sm text-foreground-muted leading-snug">
                When to meet, with auto-generated agendas and a .ics file for your calendar.
              </p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <EnvelopeIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1.5">AI-Drafted Emails</h2>
              <p className="text-sm text-foreground-muted leading-snug">
                Professional emails with the right tone and structure—ready to send.
              </p>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <ChatIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1.5">Async-First Updates</h2>
              <p className="text-sm text-foreground-muted leading-snug">
                When async wins—crafted Slack/Teams messages for quick updates.
              </p>
            </div>
          </div>
        </section>

        {/* How it works: 3 steps (merged with “Leverage AI” as step 3) */}
        <section className={`${CONTAINER_MAX} ${CONTAINER_PADDING} ${SECTION_SPACING}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">How It Works</h2>
          <div className="space-y-4">
            <div className="rounded-xl bg-surface border border-border p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-lg font-bold">1</div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Answer key questions</h3>
                <p className="text-sm text-foreground-muted">Purpose, urgency, stakeholders, and sensitivity.</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-lg font-bold">2</div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Get a recommendation</h3>
                <p className="text-sm text-foreground-muted">Meeting, email, or async—with confidence and rationale.</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface border border-border p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-lg font-bold">3</div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Use your draft</h3>
                <p className="text-sm text-foreground-muted">Agenda, email, or message—editable, plus .ics when you choose a meeting.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why leaders love */}
        <section className={`${CONTAINER_MAX} ${CONTAINER_PADDING} ${SECTION_SPACING}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">Why Leaders Love This Tool</h2>
          <ul className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { icon: ClockIcon, text: "Save hours on unnecessary meetings" },
              { icon: () => <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, text: "Increase communication effectiveness" },
              { icon: () => <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, text: "Improve stakeholder alignment" },
              { icon: () => <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: "Make confident communication decisions" },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon />
                </span>
                <span className="text-foreground text-sm sm:text-base">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className={`${CONTAINER_MAX} ${CONTAINER_PADDING} ${SECTION_SPACING}`}>
          <div className="rounded-2xl gradient-accent p-8 sm:p-10 text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to transform your communication?</h2>
            <p className="text-white/90 text-sm sm:text-base mb-6">Join leaders who make smarter decisions every day.</p>
            <Link
              href="/new-decision-v2"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-foreground font-semibold px-6 py-3 hover:bg-surface transition-colors"
            >
              <SparkleIcon className="w-4 h-4" />
              Find Your Cadence
              <span>→</span>
            </Link>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
