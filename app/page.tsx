"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function Home() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          {/* Master Promise - WCAG compliant: no uppercase, use letter-spacing instead */}
          <div className="mb-6">
            <h2 className="text-sm tracking-widest text-foreground-muted font-semibold mb-4">
              Your Decision Intelligence Command Center
            </h2>
          </div>

          {/* Main Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Turn every decision into a clear path forward.
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-foreground-muted max-w-2xl mx-auto mb-8">
            Cadence recommends whether to schedule a meeting, send an email, or use async communication — then writes the agenda or email draft for you.
          </p>

          {/* Benefits Section */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-foreground mb-2">Smart Recommendations</h3>
              <p className="text-sm text-foreground-muted">
                Get AI-powered recommendations for the best communication method: meeting, email, or async work.
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="text-3xl mb-3">✍️</div>
              <h3 className="font-semibold text-foreground mb-2">Auto-Generated Content</h3>
              <p className="text-sm text-foreground-muted">
                We compose your emails and craft your meeting agendas — ready to copy, customize, and send.
              </p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-semibold text-foreground mb-2">Save Time</h3>
              <p className="text-sm text-foreground-muted">
                Stop wasting hours on unnecessary meetings. Make better communication decisions in minutes.
              </p>
            </div>
          </div>

          {/* Strategy Bridge */}
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
              Turn Vision into Aligned Action
            </h3>
            <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto">
              Cadence helps leaders choose the right communication method — meeting, email, or async — and automatically generates the content that gets teams moving in the right direction.
            </p>
          </div>

          {/* Single Primary CTA */}
          <div className="mt-10">
            <Link href="/new-decision-v2">
              <Button variant="primary">
                Start your cadence
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
