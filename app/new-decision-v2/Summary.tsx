"use client";

import React, { useMemo, useState } from "react";
import RulesEngine from "@/app/lib/RulesEngine";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

type SummaryProps = {
  data: any;
  onBack: () => void;
};

export default function Summary({ data, onBack }: SummaryProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  const rulesResult = useMemo(() => {
    try {
      return new RulesEngine().run(data || {});
    } catch (err) {
      console.error("RulesEngine error", err);
      return null;
    }
  }, [data]);

  if (!data) {
    return (
      <div style={{ padding: 12 }}>
        <div>No data provided.</div>
        <button onClick={onBack} style={{ marginTop: 12 }}>Back</button>
      </div>
    );
  }

  const bpList = rulesResult?.best_practices
    ? String(rulesResult.best_practices)
        .split(".")
        .map((s) => s.trim())
        .filter((s) => s.length)
    : [];

  async function handleSave() {
    if (saving || authLoading) return;
    if (!user || !rulesResult) return;

    setSaving(true);

    try {
      const docRef = await addDoc(collection(db, "decisions"), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        mode: data?.mode || "full",
        input: data,
        rulesResult,
      });

      router.push(`/decision/${docRef.id}`);
    } catch (err) {
      console.error("Failed to save decision", err);
      setSaving(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, maxWidth: 760 }}>
      <h2>Summary</h2>

      {rulesResult ? (
        <>
          <div style={{ fontSize: 20, fontWeight: "700" }}>
            {rulesResult.recommendation.toUpperCase()}
          </div>

          <div style={{ marginTop: 6 }}>
            Confidence: <strong>{rulesResult.confidence_score}%</strong>
          </div>

          <div style={{ marginTop: 10, color: "#444" }}>
            {rulesResult.rationale}
          </div>

          {rulesResult.time_saved_minutes > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Estimated time saved:</strong> {rulesResult.time_saved_minutes} minutes
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <strong>Best practices</strong>
            <ul>
              {bpList.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button onClick={onBack} disabled={saving}>Back</button>
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div>No rules result available.</div>
          <button onClick={onBack}>Back</button>
        </>
      )}
    </div>
  );
}
"use client";

import React, { useMemo, useState } from "react";
import RulesEngine from "@/app/lib/RulesEngine";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";

type SummaryProps = {
  data: any;
  onBack: () => void;
};

export default function Summary({ data, onBack }: SummaryProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  const rulesResult = useMemo(() => {
    try {
      return new RulesEngine().run(data || {});
    } catch (err) {
      console.error("RulesEngine error", err);
      return null;
    }
  }, [data]);

  if (!data) {
    return (
      <div style={{ padding: 12 }}>
        <div>No data provided.</div>
        <button onClick={onBack} style={{ marginTop: 12 }}>Back</button>
      </div>
    );
  }

  const bpList =
    rulesResult?.best_practices
      ?.split(".")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length) || [];

  async function handleSave() {
    if (saving || authLoading) return;
    if (!user) {
      console.error("Not authenticated");
      return;
    }
    if (!rulesResult) {
      console.error("Missing rulesResult");
      return;
    }

    setSaving(true);

    try {
      const ref = await addDoc(collection(db, "decisions"), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        mode: "quick",
        input: data,
        rulesResult,
      });

      router.push(`/decision/${ref.id}`);
    } catch (err) {
      console.error("Save failed", err);
      setSaving(false);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, maxWidth: 760 }}>
      <h2>Summary</h2>

      {rulesResult ? (
        <>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {rulesResult.recommendation.toUpperCase()}
          </div>

          <div>
            Confidence: <strong>{rulesResult.confidence_score}%</strong>
          </div>

          <div style={{ marginTop: 8, color: "#444" }}>{rulesResult.rationale}</div>

          {rulesResult.time_saved_minutes > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Estimated time saved:</strong> {rulesResult.time_saved_minutes} minutes
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <strong>Best practices</strong>
            <ul>
              {bpList.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button onClick={onBack} disabled={saving}>Back</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? "#9ca3af" : "#2563eb",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: 6,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      ) : (
        <div>
          <div>No rules result available.</div>
          <button onClick={onBack}>Back</button>
        </div>
      )}
    </div>
  );
}
