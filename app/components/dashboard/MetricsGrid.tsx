"use client";

import React from "react";
import Card from "../ui/Card";

interface MetricsGridProps {
  totalDecisions: number;
  timeSavedTotal: number;
  communicationBreakdown: Record<string, number>;
  weeklyMetrics?: {
    decisionsThisWeek: number;
    timeSavedThisWeek: number;
    decisionsLastWeek: number;
    timeSavedLastWeek: number;
    efficiencyTrend: "up" | "down" | "stable";
  };
}

export default function MetricsGrid({
  totalDecisions,
  timeSavedTotal,
  communicationBreakdown,
  weeklyMetrics,
}: MetricsGridProps) {
  const hoursSaved = Math.round(timeSavedTotal / 60);
  const minutesSaved = timeSavedTotal % 60;

  return (
    <div className="space-y-4">
      {/* Row 1: small cards side-by-side */}
      <div className="grid grid-cols-2 gap-4">
        <Card size="small">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-foreground-muted">Total Decisions</div>
          </div>
          <div className="text-2xl font-bold text-foreground">{totalDecisions}</div>
        </Card>

        <Card size="small">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-foreground-muted">Time Saved</div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {hoursSaved > 0 ? `${hoursSaved}h ${minutesSaved}m` : `${minutesSaved}m`}
          </div>
        </Card>
      </div>

      {/* Row 2: This Week card full width */}
      <Card size="medium">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-foreground-muted">This Week</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-2xl font-bold text-foreground">{weeklyMetrics?.decisionsThisWeek || 0}</div>
            <div className="text-xs text-foreground-muted">Decisions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {weeklyMetrics?.timeSavedThisWeek
                ? `${Math.round(weeklyMetrics.timeSavedThisWeek / 60)}h ${weeklyMetrics.timeSavedThisWeek % 60}m`
                : "0m"}
            </div>
            <div className="text-xs text-foreground-muted">Time Saved</div>
          </div>
        </div>
        {weeklyMetrics?.efficiencyTrend &&
          weeklyMetrics.decisionsThisWeek > 0 &&
          weeklyMetrics.decisionsLastWeek > 0 && (
            <div className="pt-2 border-t border-border">
              {weeklyMetrics.efficiencyTrend === "up" && (
                <div className="flex items-center gap-1 text-xs text-success">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>More time saved than last week</span>
                </div>
              )}
              {weeklyMetrics.efficiencyTrend === "down" && (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
                  </svg>
                  <span>Less time saved than last week</span>
                </div>
              )}
              {weeklyMetrics.efficiencyTrend === "stable" && (
                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                  <span>Same time saved as last week</span>
                </div>
              )}
            </div>
          )}
      </Card>
    </div>
  );
}
