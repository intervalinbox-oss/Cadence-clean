"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiRequest } from "@/app/lib/api";
import MetricsGrid from "@/app/components/dashboard/MetricsGrid";
import TimeSavedChart from "@/app/components/charts/TimeSavedChart";
import CommunicationBreakdownChart from "@/app/components/charts/CommunicationBreakdownChart";
import InsightsList from "@/app/components/dashboard/InsightsList";
import ActivityTimeline from "@/app/components/dashboard/ActivityTimeline";
import Card from "@/app/components/ui/Card";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  async function loadDashboard() {
    if (!user) return;

    try {
      const [dashboard, insightsData] = await Promise.all([
        apiRequest("/dashboard"),
        apiRequest("/dashboard/insights").catch(() => ({ insights: [] })),
      ]);

      setDashboardData(dashboard);
      setInsights(insightsData.insights || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-foreground-muted">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Your Impact Dashboard
          </h1>
          <p className="text-lg text-foreground-muted">
            Track your communication efficiency and time savings
          </p>
        </div>

        {/* Section 2: Summary Metrics Grid */}
        {dashboardData && (
          <MetricsGrid
            totalDecisions={dashboardData.totalDecisions || 0}
            timeSavedTotal={dashboardData.timeSavedTotal || 0}
            communicationBreakdown={dashboardData.communicationBreakdown || {}}
            currentStreak={dashboardData.currentStreak || 0}
          />
        )}

        {/* Section 3: Time Saved Visualization */}
        {dashboardData && (
          <TimeSavedChart timeSavedByDay={dashboardData.timeSavedByDay || {}} />
        )}

        {/* Section 4: Communication Breakdown */}
        {dashboardData && (
          <CommunicationBreakdownChart
            communicationBreakdown={dashboardData.communicationBreakdown || {}}
          />
        )}

        {/* Section 5: Urgency / Tone / Sensitivity Patterns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardData?.urgencyDistribution && (
            <Card size="medium">
              <h3 className="text-lg font-semibold text-foreground mb-4">Urgency Distribution</h3>
              <div className="space-y-2">
                {Object.entries(dashboardData.urgencyDistribution).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-foreground-muted capitalize">{key}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {dashboardData?.toneDistribution && (
            <Card size="medium">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tone Distribution</h3>
              <div className="space-y-2">
                {Object.entries(dashboardData.toneDistribution).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-foreground-muted capitalize">{key}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {dashboardData?.sensitivityDistribution && (
            <Card size="medium">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sensitivity Distribution</h3>
              <div className="space-y-2">
                {Object.entries(dashboardData.sensitivityDistribution).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-foreground-muted capitalize">{key}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Section 6: Behavioral Insights */}
        {insights.length > 0 && <InsightsList insights={insights} />}

        {/* Section 7: Activity Timeline */}
        {dashboardData && (
          <ActivityTimeline decisions={dashboardData.decisions || []} />
        )}
      </div>
    </ProtectedRoute>
  );
}
