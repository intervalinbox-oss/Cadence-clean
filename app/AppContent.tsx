"use client";

import React from "react";
import AuthProvider from "./providers/AuthProvider";
import TopNav from "./components/TopNav";

/**
 * Loaded only AFTER Firebase is initialized (via FirebaseConfigProvider).
 * This chunk imports auth/db, so it must not run before init.
 */
export default function AppContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TopNav />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </AuthProvider>
  );
}
