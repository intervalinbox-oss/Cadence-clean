"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiRequest } from "@/app/lib/api";
import Link from "next/link";
import MetricsGrid from "@/app/components/dashboard/MetricsGrid";
import TimeSavedChart from "@/app/components/charts/TimeSavedChart";
import CommunicationBreakdownChart from "@/app/components/charts/CommunicationBreakdownChart";
import InsightsList from "@/app/components/dashboard/InsightsList";
import ActivityTimeline from "@/app/components/dashboard/ActivityTimeline";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        apiRequest<{ insights: string[] }>("/dashboard/insights").catch(() => ({ insights: [] })),
      ]);

      setDashboardData(dashboard);
      setInsights(insightsData.insights || []);
      setError(null);
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      
      // Check if it's an API URL configuration error
      const errorMessage = error?.message || String(error) || "";
      const isApiConfigError = errorMessage.includes("API base URL is not configured") || 
                               errorMessage.includes("NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL") ||
                               errorMessage.includes("Invalid API base URL format");
      
      if (isApiConfigError) {
        setError("api_config");
      } else {
        setError(errorMessage || "Failed to load dashboard data");
      }
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

  // Show API configuration error with helpful instructions
  if (error === "api_config") {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card size="large" className="max-w-3xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">API Configuration Required</h2>
              <p className="text-foreground-muted">
                The dashboard requires your Firebase Functions URL to be configured. 
                You need to set the <code className="bg-surface px-2 py-1 rounded text-sm">NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL</code> environment variable.
              </p>
              
              <div className="bg-surface p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-foreground">Option 1: Deploy Firebase Functions (Recommended)</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-foreground-muted">
                  <li>Deploy your Firebase Functions:
                    <pre className="bg-background p-2 rounded mt-1 text-xs overflow-x-auto">
                      <code>cd functions && firebase deploy --only functions</code>
                    </pre>
                  </li>
                  <li>After deployment, note your function URL (format: <code className="bg-background px-1 rounded">https://us-central1-cadence-956b5.cloudfunctions.net/api</code>)</li>
                  <li>Create a <code className="bg-background px-1 rounded">.env.local</code> file in the root directory</li>
                  <li>Add this line:
                    <pre className="bg-background p-2 rounded mt-1 text-xs overflow-x-auto">
                      <code>NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-cadence-956b5.cloudfunctions.net/api</code>
                    </pre>
                  </li>
                  <li>Restart your dev server (<code className="bg-background px-1 rounded">npm run dev</code>)</li>
                </ol>
              </div>

              <div className="bg-surface p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-foreground">Option 2: Use Firebase Emulators (Local Testing)</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-foreground-muted">
                  <li>Start Firebase emulators:
                    <pre className="bg-background p-2 rounded mt-1 text-xs overflow-x-auto">
                      <code>firebase emulators:start --only functions</code>
                    </pre>
                  </li>
                  <li>Create a <code className="bg-background px-1 rounded">.env.local</code> file with:
                    <pre className="bg-background p-2 rounded mt-1 text-xs overflow-x-auto">
                      <code>NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=http://localhost:5001/cadence-956b5/us-central1/api</code>
                    </pre>
                  </li>
                  <li>Restart your dev server</li>
                </ol>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-foreground-muted">
                  <strong>Note:</strong> Your Firebase project ID is <code className="bg-surface px-1 rounded">cadence-956b5</code>. 
                  Replace it in the URLs above if different.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  // Show other errors
  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card size="large" className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Dashboard</h2>
            <p className="text-error">{error}</p>
            <Button 
              variant="primary" 
              onClick={loadDashboard}
              className="mt-4"
            >
              Try Again
            </Button>
          </Card>
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
        {dashboardData ? (
          <MetricsGrid
            totalDecisions={dashboardData.totalDecisions || 0}
            timeSavedTotal={dashboardData.timeSavedTotal || 0}
            communicationBreakdown={dashboardData.communicationBreakdown || {}}
            weeklyMetrics={dashboardData.weeklyMetrics}
          />
        ) : (
          <Card size="large">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to your dashboard</h3>
              <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                Your metrics and insights will appear here once you start making decisions. Track your communication efficiency and see how much time you're saving.
              </p>
              <Link href="/new-decision-v2">
                <Button variant="primary">Create Your First Decision</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Section 3: Time Saved Visualization */}
        {dashboardData && (
          <TimeSavedChart timeSavedByDay={dashboardData.timeSavedByDay || {}} />
        )}

        {/* Section 4: Communication Breakdown */}
        {dashboardData && (
          <CommunicationBreakdownChart
            communicationBreakdown={dashboardData.communicationBreakdown || {}}
            title="Communication Method Breakdown"
            subtitle="How your decisions were communicated: meetings, emails, or async messages"
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
