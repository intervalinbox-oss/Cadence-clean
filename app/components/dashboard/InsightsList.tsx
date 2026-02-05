"use client";

import React from "react";
import Card from "../ui/Card";

interface InsightsListProps {
  insights: string[];
}

export default function InsightsList({ insights }: InsightsListProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card size="large">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-xl font-semibold text-foreground">Behavioral Insights</h3>
      </div>
      <p className="text-sm text-foreground-muted mb-4">Focused on time saved and how you communicate.</p>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-accent-blue mt-1">•</span>
            <span className="text-foreground flex-1">{insight}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
