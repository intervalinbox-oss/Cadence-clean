"use client";

import React, { Suspense, useEffect, useState } from "react";
import { initializeFirebaseFromConfig } from "@/app/lib/firebase";

const LazyAppContent = React.lazy(() => import("@/app/AppContent"));

const loadingUI = (
  <div className="min-h-screen bg-background flex flex-col">
    <header className="h-16 border-b border-border bg-surface flex items-center px-4">
      <span className="font-semibold text-lg text-foreground">Cadence</span>
    </header>
    <main className="min-h-[calc(100vh-4rem)] flex-1 flex items-center justify-center">
      <p className="text-foreground-muted">Loading…</p>
    </main>
  </div>
);

export default function FirebaseConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const buildTimeConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    };

    if (buildTimeConfig.apiKey?.trim() && buildTimeConfig.projectId?.trim()) {
      initializeFirebaseFromConfig(buildTimeConfig);
      setReady(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch("/firebase-config.json", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setError("Firebase config not found.");
          return;
        }
        const config = await res.json();
        if (!config?.apiKey?.trim() || !config?.projectId?.trim()) {
          setError("Firebase config is incomplete.");
          return;
        }
        initializeFirebaseFromConfig(config);
        if (!cancelled) setReady(true);
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
          <p className="text-sm text-foreground-muted">
            Add <code className="font-mono text-xs bg-surface px-1 rounded">public/firebase-config.json</code> (copy from <code className="font-mono text-xs bg-surface px-1 rounded">firebase-config.example.json</code>) with your Firebase web app config, then redeploy.
          </p>
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
    return loadingUI;
  }

  return (
    <Suspense fallback={loadingUI}>
      <LazyAppContent>{children}</LazyAppContent>
    </Suspense>
  );
}
