"use client";

import React from "react";
import Card from "../ui/Card";
import Link from "next/link";
import Badge from "../ui/Badge";

interface Decision {
  id: string;
  communicationType?: string;
  timestamp?: number;
  inputs?: any;
  outputs?: any;
}

interface ActivityTimelineProps {
  decisions: Decision[];
}

export default function ActivityTimeline({ decisions }: ActivityTimelineProps) {
  if (!decisions || decisions.length === 0) {
    return (
      <Card size="large">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Activity Timeline</h3>
          <p className="text-foreground-muted mb-6 max-w-md mx-auto">
            Your decision history will appear here. Start making decisions to track your communication patterns and time savings.
          </p>
          <Link
            href="/new-decision-v2"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Create Your First Decision
          </Link>
        </div>
      </Card>
    );
  }

  const getCommunicationIcon = (type?: string) => {
    switch (type) {
      case "meeting":
        return "💻";
      case "email":
        return "✉️";
      case "async_message":
        return "💬";
      default:
        return "📋";
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Card size="large">
      <h3 className="text-xl font-semibold text-foreground mb-6">Activity Timeline</h3>
      <div className="space-y-4">
        {decisions.map((decision) => (
          <Link
            key={decision.id}
            href={`/decision/${decision.id}`}
            className="block p-4 border border-border rounded-lg hover:bg-surface transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getCommunicationIcon(decision.communicationType)}</span>
                <div className="flex-1">
                  <div className="font-medium text-foreground mb-1">
                    {decision.inputs?.title || decision.inputs?.purpose || "Untitled Decision"}
                  </div>
                  <div className="text-sm text-foreground-muted">
                    {formatDate(decision.timestamp)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {decision.communicationType && (
                  <Badge variant="default">
                    {decision.communicationType}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
