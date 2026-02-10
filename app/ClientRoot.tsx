"use client";

import React, { useEffect, useState } from "react";

const LoadingShell = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <header className="h-16 border-b border-border bg-surface flex items-center px-4">
      <span className="font-semibold text-lg text-foreground">Cadence</span>
    </header>
    <main className="min-h-[calc(100vh-4rem)] flex-1" />
  </div>
);

/**
 * Loads AppShell only after client mount so the server never imports Firebase during prerender.
 */
export default function ClientRoot({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [AppShell, setAppShell] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    import("./AppShell").then((m) => setAppShell(() => m.default));
  }, []);

  if (!AppShell) {
    return <LoadingShell />;
  }
  return <AppShell>{children}</AppShell>;
}
