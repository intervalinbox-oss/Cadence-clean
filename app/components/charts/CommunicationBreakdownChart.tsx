"use client";

import React from "react";
import Card from "../ui/Card";

interface CommunicationBreakdownChartProps {
  communicationBreakdown: Record<string, number>;
  title?: string;
  subtitle?: string;
}

export default function CommunicationBreakdownChart({
  communicationBreakdown,
  title = "How You're Communicating",
  subtitle,
}: CommunicationBreakdownChartProps) {
  const total = Object.values(communicationBreakdown).reduce((a, b) => a + b, 0);
  
  const items = [
    { key: "meeting", label: "Meetings", color: "bg-accent-blue", icon: "💻", description: "Scheduled meetings" },
    { key: "email", label: "Emails", color: "bg-success", icon: "✉️", description: "Email communications" },
    { key: "async_message", label: "Async Messages", color: "bg-accent-purple", icon: "💬", description: "Slack, Teams, etc." },
    { key: "cancel_meeting", label: "Cancelled", color: "bg-warning", icon: "❌", description: "Unnecessary meetings avoided" },
  ];

  return (
    <Card size="large">
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>
        )}
      </div>
      {total === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-foreground-muted mb-2">No Communication Data Yet.</p>
          <p className="text-sm text-foreground-muted">Your communication method breakdown will appear here once you start making decisions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const count = communicationBreakdown[item.key] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-foreground-muted ml-2">{item.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{count}</span>
                    <span className="text-sm text-foreground-muted">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-4 bg-surface border border-border rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-label={`${item.label}: ${count} (${percentage}%)`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
