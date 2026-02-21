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
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden />
          <p className="text-sm text-foreground-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // After loading: if still no user → render nothing (redirect already triggered)
  if (!user) return null;

  return <>{children}</>;
}
