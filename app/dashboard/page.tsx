"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiRequest } from "@/app/lib/api";
import MetricsGrid from "@/app/components/dashboard/MetricsGrid";
import CommunicationBreakdownChart from "@/app/components/charts/CommunicationBreakdownChart";
import InsightsList from "@/app/components/dashboard/InsightsList";
import ActivityTimeline from "@/app/components/dashboard/ActivityTimeline";
import Card from "@/app/components/ui/Card";

type DashboardError = { type: "config" } | { type: "index"; indexUrl: string } | { type: "unreachable" } | null;

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<DashboardError>(null);

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
        apiRequest("/dashboard/insights").catch((): { insights: string[] } => ({ insights: [] })),
      ]);

      setDashboardData(dashboard);
      setInsights((insightsData as { insights?: string[] }).insights || []);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const errWithIndex = err as Error & { indexUrl?: string };
      if (msg.includes("API base URL is not configured")) {
        setError({ type: "config" });
      } else if (msg.includes("requires an index") || msg.includes("Failed to fetch dashboard data") || msg.includes("Failed to generate insights")) {
        setError({ type: "index", indexUrl: errWithIndex.indexUrl || "https://console.firebase.google.com/project/cadence-956b5/firestore/indexes" });
      } else if (msg.includes("Could not reach the API") || msg.includes("Could not reach Firebase Functions") || msg.includes("Failed to fetch")) {
        setError({ type: "unreachable" });
      }
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const hasError = error !== null;
  const showContent = dashboardData && !hasError;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Communication + Time Saved
          </h1>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-foreground-muted">Loading dashboard...</p>
          </div>
        )}

        {error?.type === "config" && (
          <Card size="large">
            <h2 className="text-xl font-semibold text-foreground mb-2">API not configured</h2>
            <p className="text-foreground-muted mb-4">
              Set your Firebase Functions URL so the dashboard can load. In your project root, create or edit <code className="bg-muted px-1 rounded text-sm">.env.local</code> and add:
            </p>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto mb-4">
              NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net/api
            </pre>
            <p className="text-foreground-muted text-sm">
              Replace with your deployed function URL (see <code className="bg-muted px-1 rounded">.env.example</code>), then restart the dev server.
            </p>
          </Card>
        )}

        {error?.type === "index" && (
          <Card size="large">
            <h2 className="text-xl font-semibold text-foreground mb-2">Firestore index required</h2>
            <p className="text-foreground-muted mb-4">
              The dashboard query needs a Firestore index. Create it once, then reload.
            </p>
            <p className="mb-4">
              <a href={error.indexUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Create the index in Firebase Console →
              </a>
            </p>
            <p className="text-foreground-muted text-sm">
              Or run from project root: <code className="bg-muted px-1 rounded">firebase deploy --only firestore:indexes</code>. Index build can take a few minutes.
            </p>
          </Card>
        )}

        {error?.type === "unreachable" && (
          <Card size="large">
            <h2 className="text-xl font-semibold text-foreground mb-2">Could not reach the API</h2>
            <p className="text-foreground-muted mb-4">
              The dashboard could not connect to your Firebase Functions. Try:
            </p>
            <ul className="list-disc list-inside text-foreground-muted space-y-2 mb-4">
              <li>Deploy functions: <code className="bg-muted px-1 rounded text-sm">firebase deploy --only functions</code> (from project root)</li>
              <li>Confirm <code className="bg-muted px-1 rounded text-sm">NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL</code> in <code className="bg-muted px-1 rounded">.env.local</code> matches the URL shown after deploy</li>
              <li>Restart the Next.js dev server after changing <code className="bg-muted px-1 rounded">.env.local</code></li>
            </ul>
            <p className="text-foreground-muted text-sm">
              The URL should look like: <code className="bg-muted px-1 rounded break-all">https://us-central1-cadence-956b5.cloudfunctions.net/api</code>
            </p>
          </Card>
        )}

        {showContent && (
          <MetricsGrid
            totalDecisions={dashboardData.totalDecisions || 0}
            timeSavedTotal={dashboardData.timeSavedTotal || 0}
            communicationBreakdown={dashboardData.communicationBreakdown || {}}
            weeklyMetrics={dashboardData.weeklyMetrics}
          />
        )}

        {showContent && (
          <CommunicationBreakdownChart
            communicationBreakdown={dashboardData.communicationBreakdown || {}}
            title="How You're Communicating"
          />
        )}

        {showContent && (dashboardData.urgencyDistribution || dashboardData.toneDistribution || dashboardData.sensitivityDistribution) && (
          <Card size="large">
            <h3 className="text-lg font-semibold text-foreground mb-4">Communication Patterns</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.urgencyDistribution && Object.keys(dashboardData.urgencyDistribution).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground-muted mb-2">Urgency</h4>
                  <div className="space-y-1.5">
                    {Object.entries(dashboardData.urgencyDistribution).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-foreground-muted capitalize">{key}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dashboardData.toneDistribution && Object.keys(dashboardData.toneDistribution).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground-muted mb-2">Tone</h4>
                  <div className="space-y-1.5">
                    {Object.entries(dashboardData.toneDistribution).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-foreground-muted capitalize">{key}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dashboardData.sensitivityDistribution && Object.keys(dashboardData.sensitivityDistribution).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground-muted mb-2">Sensitivity</h4>
                  <div className="space-y-1.5">
                    {Object.entries(dashboardData.sensitivityDistribution).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-foreground-muted capitalize">{key}</span>
                        <span className="font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {!hasError && (() => {
          const filteredInsights = (insights || []).filter(
            (s) => /saved|hour|intentional|avoided|choosing|recommended/i.test(s)
          );
          return filteredInsights.length > 0 ? <InsightsList insights={filteredInsights} /> : null;
        })()}

        {showContent && (
          <ActivityTimeline decisions={dashboardData.decisions || []} />
        )}
      </div>
    </ProtectedRoute>
  );
}
