"use client";

import React from "react";
import Card from "../ui/Card";

interface TimeSavedChartProps {
  timeSavedByDay: Record<string, number>;
}

export default function TimeSavedChart({ timeSavedByDay }: TimeSavedChartProps) {
  const days = Object.keys(timeSavedByDay).sort().slice(-7); // Last 7 days
  const maxValue = Math.max(...Object.values(timeSavedByDay), 1);

  return (
    <Card size="large">
      <h3 className="text-xl font-semibold text-foreground mb-6">Time Saved</h3>
      <div className="space-y-3">
        {days.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">⏱️</div>
            <p className="text-foreground-muted mb-2">No time saved data yet.</p>
            <p className="text-sm text-foreground-muted">Start making decisions to see how much time you're saving.</p>
          </div>
        ) : (
          days.map((day) => {
            const value = timeSavedByDay[day] || 0;
            const percentage = (value / maxValue) * 100;
            const date = new Date(day);
            const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <div key={day} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">{dayLabel}</span>
                  <span className="font-medium text-foreground">{value}m</span>
                </div>
                <div className="w-full h-3 bg-surface border border-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-teal transition-all"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={maxValue}
                    aria-label={`${value} minutes saved on ${dayLabel}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
