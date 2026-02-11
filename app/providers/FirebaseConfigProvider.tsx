"use client";

import React, { useEffect, useState } from "react";
import { initializeFirebaseFromConfig } from "@/app/lib/firebase";

export default function FirebaseConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/firebase-config");
        if (cancelled) return;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Firebase config not available. Set NEXT_PUBLIC_FIREBASE_* in Vercel → Project → Settings → Environment Variables, then redeploy.");
          return;
        }
        const config = await res.json();
        initializeFirebaseFromConfig(config);
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load Firebase config");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Configuration needed</h1>
          <p className="text-sm text-foreground-muted">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-medium hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b border-border bg-surface flex items-center px-4">
          <span className="font-semibold text-lg text-foreground">Cadence</span>
        </header>
        <main className="min-h-[calc(100vh-4rem)] flex-1 flex items-center justify-center">
          <p className="text-foreground-muted">Loading…</p>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
