"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { db } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setDecisions([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "decisions"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      unsubSnapshot = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setDecisions(items as any[]);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      unsubAuth();
    };
  }, []);

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const filteredDecisions = decisions.filter((d) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = d.inputs?.title || d.input?.title || "";
      const purpose = d.inputs?.purpose || d.input?.purpose || "";
      if (
        !title.toLowerCase().includes(query) &&
        !purpose.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Type filter
    if (filterType !== "all" && d.communicationType !== filterType) {
      return false;
    }

    // Urgency filter
    if (filterUrgency !== "all" && d.urgency !== filterUrgency) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-foreground-muted">Loading decisions...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card size="large">
            <p className="text-error">{error}</p>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Decision History
            </h1>
            <p className="text-lg text-foreground-muted">
              Review your past communication recommendations
            </p>
          </div>
          <Link href="/new-decision">
            <Button variant="primary">+ Find Your Cadence</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>📊</span>
              <div className="text-sm font-medium text-foreground-muted">Total Decisions</div>
            </div>
            <div className="text-2xl font-bold text-foreground">{decisions.length}</div>
          </Card>
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>💻</span>
              <div className="text-sm font-medium text-foreground-muted">Meetings</div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {decisions.filter((d) => d.communicationType === "meeting").length}
            </div>
          </Card>
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>✉️</span>
              <div className="text-sm font-medium text-foreground-muted">Emails</div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {decisions.filter((d) => d.communicationType === "email").length}
            </div>
          </Card>
          <Card size="small">
            <div className="flex items-center gap-2 mb-2">
              <span>💬</span>
              <div className="text-sm font-medium text-foreground-muted">Async Messages</div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {decisions.filter((d) => d.communicationType === "async_message").length}
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card size="medium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search decisions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or purpose..."
              id="history-search"
            />
            <Select
              label="Communication Type"
              options={[
                { value: "all", label: "All Types" },
                { value: "meeting", label: "Meetings" },
                { value: "email", label: "Emails" },
                { value: "async_message", label: "Async Messages" },
              ]}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              id="history-filter-type"
            />
            <Select
              label="Urgency"
              options={[
                { value: "all", label: "All Urgency Levels" },
                { value: "none", label: "No rush" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              id="history-filter-urgency"
            />
          </div>
        </Card>

        {/* Decisions List */}
        {filteredDecisions.length === 0 ? (
          <Card size="large">
            <div className="text-center py-12">
              <p className="text-foreground-muted mb-4">
                {decisions.length === 0
                  ? "No decisions found. Start making decisions to see them here."
                  : "No decisions match your filters."}
              </p>
              {decisions.length === 0 && (
                <Link href="/new-decision">
                  <Button variant="primary">Create Your First Decision</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDecisions.map((decision) => {
              const title = decision.inputs?.title || decision.input?.title || "Untitled Decision";
              const description = decision.inputs?.purpose || decision.input?.purpose || "";
              const communicationType = decision.communicationType || "unknown";
              const urgency = decision.urgency || "unknown";
              const confidence = decision.outputs?.recommendations?.confidence_score || decision.rulesResult?.confidence_score || 0;

              return (
                <Card key={decision.id} size="medium" className="hover:shadow-md transition-shadow">
                  <Link href={`/decision/${decision.id}`}>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-4xl flex-shrink-0">
                        {getCommunicationIcon(communicationType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                          {title}
                        </h3>
                        {description && (
                          <p className="text-sm text-foreground-muted mb-3 line-clamp-2">
                            {description}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="default">{communicationType}</Badge>
                          <Badge variant="default">{urgency} urgency</Badge>
                          {confidence > 0 && (
                            <Badge variant="success">{confidence}% confidence</Badge>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-xs text-foreground-muted">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(decision.timestamp || decision.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(window.location.origin + `/decision/${decision.id}`);
                          }}
                          className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                          aria-label="Copy link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
