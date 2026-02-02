"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function DecisionDetailClient({ id }: { id?: string }) {
  const [decision, setDecision] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No decision id provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    getDoc(doc(db, "decisions", id))
      .then((snap) => {
        if (!snap.exists()) {
          setError("Decision not found");
        } else {
          setDecision({ id: snap.id, ...snap.data() });
        }
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>{error}</div>;
  if (!decision) return <div style={{ padding: 24 }}>No decision found.</div>;

  const createdAt = decision.createdAt && (decision.createdAt as any).toDate ? (decision.createdAt as any).toDate().toLocaleString() : "-";

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>{decision.summary || "Decision"}</h1>
      <div style={{ color: "#666", marginBottom: 12 }}>{createdAt}</div>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recommendation</h2>
        <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 6 }}>{decision.recommendation || "(none)"}</div>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Summary / Details</h2>
        <pre style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 12, borderRadius: 6 }}>{JSON.stringify(decision.data, null, 2)}</pre>
      </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Cadence Recommendation</h2>
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, background: "#fff" }}>
              {decision.rulesResult ? (
                (() => {
                  const r = decision.rulesResult as any;
                  const data = decision.data || {};
                  const mapRec = (rec: string) => {
                    switch (rec) {
                      case 'meeting': return 'Meeting';
                      case 'email': return 'Email';
                      case 'async_message': return 'Async Message';
                      case 'cancel_meeting': return 'Cancel Meeting';
                      case 'no_action': return 'No Action';
                      default: return rec;
                    }
                  };

                  return (
                    <div>
                      {/* Recommendation Hero Section */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 700 }}>{mapRec(r.recommendation)}</div>
                          <div style={{ color: '#444', marginTop: 6 }}>{r.rationale}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: '#f3f4f6', fontWeight: 600 }}>
                            Confidence: {r.confidence_score}%
                          </div>
                        </div>
                      </div>

                      {/* Key Decision Drivers */}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Key Decision Drivers</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div><strong>Urgency:</strong> {data.urgency ?? data.urgencyLevel ?? '—'}</div>
                          <div><strong>Complexity:</strong> {data.complexity ?? '—'}</div>
                          <div><strong>Stakeholders:</strong> {data.stakeholderCount ?? data.stakeholders ?? '—'}</div>
                          <div><strong>Cross-team:</strong> {String(data.crossTeamDependencies ?? data.crossTeam ?? false)}</div>
                          <div><strong>Emotional risk:</strong> {data.emotionalRisk ?? '—'}</div>
                          <div><strong>Change impact:</strong> {data.changeImpact ?? '—'}</div>
                        </div>
                      </div>

                      {/* Scoring Breakdown */}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Scoring Breakdown</div>
                        {['meeting','email','async'].map((key) => {
                          const label = key === 'meeting' ? 'Meeting' : key === 'email' ? 'Email' : 'Async';
                          const pct = key === 'meeting' ? (r.scores?.meeting ?? 0) : key === 'email' ? (r.scores?.email ?? 0) : (r.scores?.async ?? 0);
                          const color = key === 'meeting' ? '#3b82f6' : key === 'email' ? '#10b981' : '#f59e0b';
                          return (
                            <div key={key} style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <div style={{ fontSize: 13 }}>{label}</div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{pct}%</div>
                              </div>
                              <div style={{ width: '100%', height: 10, background: '#e6e6e6', borderRadius: 6 }}>
                                <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: color, borderRadius: 6 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Conditional blocks */}
                      <div style={{ marginTop: 14 }}>
                        {r.recommendation === 'meeting' && (
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Meeting Details</div>
                            <div><strong>Length:</strong> {r.meeting_length || 0} minutes</div>
                            <div><strong>Cadence:</strong> {r.meeting_cadence || 'one_off'}</div>
                            <div style={{ marginTop: 8 }}><strong>Participants:</strong>
                              <ul style={{ marginTop: 6 }}>
                                {(r.participants || []).map((p: string, i: number) => (<li key={i}>{p}</li>))}
                              </ul>
                            </div>
                            <div style={{ marginTop: 8 }}><strong>Best practices:</strong>
                              <div style={{ marginTop: 6 }}>{r.best_practices}</div>
                            </div>
                          </div>
                        )}

                        {(r.recommendation === 'email' || r.recommendation === 'async_message') && (
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Best Practices</div>
                            <div>{r.best_practices}</div>
                          </div>
                        )}

                        {r.recommendation === 'cancel_meeting' && (
                          <div style={{ fontStyle: 'italic' }}>This meeting is unnecessary based on your inputs.</div>
                        )}
                      </div>

                      {/* Time saved */}
                      {r.time_saved_minutes > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <strong>Estimated time saved:</strong> {r.time_saved_minutes} minutes
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div style={{ color: '#999' }}>No rules engine output available for this decision.</div>
              )}
            </div>
          </section>
    </div>
  );
}
