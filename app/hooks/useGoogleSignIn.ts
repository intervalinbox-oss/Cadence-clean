"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/app/lib/firebase";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
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
    return "Sign-in was blocked. Please try again.";
  }
  if (errorCode === "auth/invalid-credential") {
    return "Google sign-in is not properly configured. Please contact support or use email/password.";
  }
  if (errorCode === "auth/account-exists-with-different-credential") {
    return "An account already exists with this email. Please sign in with email/password.";
  }
  return fallback;
}

export function useGoogleSignIn({ router, next, setError, onClear }: UseGoogleSignInOptions) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.push(next);
        }
      })
      .catch(() => {});
  }, [router, next]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleGoogle() {
    onClear?.();
    setError(null);
    setGoogleLoading(true);

    timeoutRef.current = setTimeout(() => {
      setGoogleLoading(false);
      setError(
        "Sign-in did not redirect. Add this site's domain in Firebase Console → Authentication → Settings → Authorized domains, then try again."
      );
      timeoutRef.current = null;
    }, 4000);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: unknown) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const errorCode = (err as { code?: string })?.code;
      const fallback = (err as { message?: string })?.message || "Google sign-in failed.";
      setError(getGoogleErrorMessage(errorCode, fallback));
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setGoogleLoading(false);
    }
  }

  return { handleGoogle, googleLoading };
}
