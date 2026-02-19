"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

type UseGoogleSignInOptions = {
  router: { push: (path: string) => void };
  next: string;
  setError: (message: string | null) => void;
  onClear?: () => void;
};

function getGoogleErrorMessage(errorCode: string | undefined, fallback: string): string {
  if (errorCode === "auth/unauthorized-domain") {
    return "This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.";
  }
  if (errorCode === "auth/popup-blocked") {
    return "Sign-in was blocked by your browser. Allow popups for this site and try again.";
  }
  if (errorCode === "auth/popup-closed-by-user") {
    return "Sign-in was cancelled.";
  }
  if (errorCode === "auth/invalid-credential") {
    return "Google sign-in is not properly configured. Please contact support or use email/password.";
  }
  if (errorCode === "auth/account-exists-with-different-credential") {
    return "An account already exists with this email. Please sign in with email/password.";
  }
  if (fallback.toLowerCase().includes("requested action is invalid") || fallback.toLowerCase().includes("action is invalid")) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `Add ${origin} to: (1) Firebase Console → Auth → Settings → Authorized domains; (2) Google Cloud → Credentials → OAuth Client → Authorized JavaScript origins; (3) Authorized redirect URIs: https://cadence-956b5.firebaseapp.com/__/auth/handler (double underscore). If using localhost, prefer http://localhost:3000 over 127.0.0.1.`;
  }
  return fallback;
}

export function useGoogleSignIn({ router, next, setError, onClear }: UseGoogleSignInOptions) {
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    onClear?.();
    setError(null);
    setGoogleLoading(true);
    // #region agent log
    if (typeof fetch !== "undefined") fetch("http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"useGoogleSignIn.ts:handleGoogle:start",message:"Google sign-in started",data:{origin:typeof window !== "undefined" ? window.location.origin : "",href:typeof window !== "undefined" ? window.location.href : ""},hypothesisId:"H-G1",timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    try {
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup to avoid blank handler screen (popup postMessage fails in some browsers)
      signInWithRedirect(auth, provider);
      // #region agent log
      if (typeof fetch !== "undefined") fetch("http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"useGoogleSignIn.ts:handleGoogle:redirect",message:"signInWithRedirect called, page will navigate",data:{},hypothesisId:"H-G1",timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      // Page navigates away; no need to router.push
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      const fallback = (err as { message?: string })?.message || "Google sign-in failed.";
      const customData = (err as { customData?: unknown })?.customData;
      // #region agent log
      if (typeof fetch !== "undefined") fetch("http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({location:"useGoogleSignIn.ts:catch",message:"Google sign-in error",data:{errorCode,msg:fallback,origin:typeof window !== "undefined" ? window.location.origin : "",customData:customData ? JSON.stringify(customData) : undefined},hypothesisId:"H-G1,H-G2,H-G3,H-G4,H-G5",timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(getGoogleErrorMessage(errorCode, fallback));
    } finally {
      setGoogleLoading(false);
    }
  }

  return { handleGoogle, googleLoading };
}
