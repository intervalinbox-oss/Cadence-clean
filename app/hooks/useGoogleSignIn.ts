"use client";

import { useState } from "react";
import { auth } from "@/app/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        router.push(next);
      }
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      const fallback = (err as { message?: string })?.message || "Google sign-in failed.";
      setError(getGoogleErrorMessage(errorCode, fallback));
    } finally {
      setGoogleLoading(false);
    }
  }

  return { handleGoogle, googleLoading };
}
