"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { db } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import Link from "next/link";

export default function HistoryPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        orderBy("createdAt", "desc")
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

  if (loading) return <p style={{ padding: 24 }}>Loading decisions...</p>;
  if (error) return <p style={{ padding: 24, color: "red" }}>{error}</p>;

  return (
    <ProtectedRoute>
      <div style={{ padding: 24 }}>
        <h1>History</h1>
      {decisions.length === 0 ? (
        <p>No decisions found.</p>
      ) : (
        <ul>
          {decisions.map((d) => {
            const createdAt = (d.createdAt && (d.createdAt as any).toDate)
              ? (d.createdAt as any).toDate().toLocaleString()
              : "-";
            const summary = d.summary || (d.responses && d.responses.title) || "(no summary)";

            return (
              <li key={d.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, color: "#444" }}>{createdAt}</div>
                <div style={{ fontWeight: 600 }}>
                  <Link href={`/decision/${d.id}`}>{summary}</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

        <p style={{ marginTop: 12 }}>
          TODO: Add pagination, details view, and filters. This currently reads
          from the `decisions` collection for the authenticated user.
        </p>
      </div>
    </ProtectedRoute>
  );
}
