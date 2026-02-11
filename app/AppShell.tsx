"use client";

import React from "react";
import FirebaseConfigProvider from "./providers/FirebaseConfigProvider";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <FirebaseConfigProvider>{children}</FirebaseConfigProvider>;
}
