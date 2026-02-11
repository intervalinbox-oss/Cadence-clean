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
  const [errorDetail, setErrorDetail] = useState<{ missing?: string[]; present?: string[]; hint?: string; buildHadConfig?: boolean }>({});

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
        const staticRes = await fetch("/firebase-config.json");
        if (cancelled) return;
        if (staticRes.ok) {
          const config = await staticRes.json();
          if (config?.apiKey?.trim() && config?.projectId?.trim()) {
            initializeFirebaseFromConfig(config);
            if (!cancelled) setReady(true);
            return;
          }
        }
        const res = await fetch("/api/firebase-config");
        if (cancelled) return;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Firebase config not available.");
          setErrorDetail({
            missing: data.missing,
            present: data.present,
            hint: data.hint,
            buildHadConfig: false,
          });
          return;
        }
        const config = await res.json();
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
          {errorDetail.missing?.length ? (
            <p className="text-xs text-foreground-muted font-mono text-left break-all">
              Missing: {errorDetail.missing.join(", ")}
            </p>
          ) : null}
          {errorDetail.present?.length !== undefined ? (
            <p className="text-xs text-foreground-muted font-mono text-left break-all">
              Present at runtime: {errorDetail.present.length ? errorDetail.present.join(", ") : "none"}
            </p>
          ) : null}
          {errorDetail.buildHadConfig === false ? (
            <p className="text-xs text-foreground-muted">
              Build had no config: NEXT_PUBLIC_FIREBASE_* were not inlined at build time. In Vercel, ensure the variables exist for this project and are enabled for the environment that builds (e.g. Production). Redeploy after adding or changing them.
            </p>
          ) : null}
          {errorDetail.hint ? (
            <p className="text-sm text-foreground-muted">{errorDetail.hint}</p>
          ) : null}
          <p className="text-sm text-foreground-muted border-t border-border pt-3 mt-2">
            Or add <code className="font-mono text-xs bg-surface px-1 rounded">public/firebase-config.json</code> (copy from <code className="font-mono text-xs bg-surface px-1 rounded">firebase-config.example.json</code>) with your Firebase web app config, commit and redeploy.
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
