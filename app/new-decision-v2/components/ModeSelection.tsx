"use client";

import React from "react";
import Card from "@/app/components/ui/Card";

interface ModeSelectionProps {
  onSelectMode: (mode: "quick" | "full") => void;
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Find your Cadence
        </h1>
        <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
          Answer a few questions and we&apos;ll recommend whether to schedule a meeting, send an email, or work via async communication. We&apos;ll compose the email or craft the meeting agenda for you.
        </p>
      </div>

      {/* Section Title */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Choose your path</h2>
        <p className="text-foreground-muted">How much detail do you want to provide?</p>
      </div>

      {/* Mode Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Quick Mode Card */}
        <Card
          size="large"
          onClick={() => onSelectMode("quick")}
          role="button"
          aria-label="Select Quick Mode"
          className="hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Quick Mode</h3>
            <p className="text-foreground-muted mb-6 flex-grow">
              Answer 5 essential questions and get a streamlined recommendation.
            </p>
            <div className="w-full inline-flex items-center justify-center rounded-lg font-medium px-4 py-2.5 text-base bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-teal text-white">
              Fastest option
            </div>
          </div>
        </Card>

        {/* Full Wizard Card */}
        <Card
          size="large"
          onClick={() => onSelectMode("full")}
          role="button"
          aria-label="Select Full Wizard"
          className="hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Full Wizard</h3>
            <p className="text-foreground-muted mb-6 flex-grow">
              Comprehensive guidance with detailed context and tailored recommendations.
            </p>
            <div className="w-full inline-flex items-center justify-center rounded-lg font-medium px-4 py-2.5 text-base bg-gradient-to-r from-accent-green via-accent-teal to-accent-cyan text-white">
              Most detailed
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
