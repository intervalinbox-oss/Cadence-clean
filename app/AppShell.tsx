"use client";

import React from "react";
import AuthProvider from "./providers/AuthProvider";
import TopNav from "./components/TopNav";

export default function AppShell({
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
