"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect ONLY after we know auth state for sure
  React.useEffect(() => {
    if (loading) return;             // ❗ prevent premature redirect (KEY FIX)
    if (user) return;                // logged in → allow page to load

    const next = pathname || "/";
    router.push(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, user, router, pathname]);

  // Show loading screen while Firebase determines auth state
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div>Loading...</div>
      </div>
    );
  }

  // After loading: if still no user → render nothing (redirect already triggered)
  if (!user) return null;

  return <>{children}</>;
}
