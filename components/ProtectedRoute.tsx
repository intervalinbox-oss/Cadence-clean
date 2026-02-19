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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:useEffect',message:'ProtectedRoute auth check',data:{loading,hasUser:!!user,pathname},hypothesisId:'H4,H5',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (loading) return;             // ❗ prevent premature redirect (KEY FIX)
    if (user) return;                // logged in → allow page to load

    const next = pathname || "/";
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:useEffect:redirect',message:'Redirecting to login',data:{pathname,next},hypothesisId:'H4',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
