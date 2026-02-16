/**
 * Auth helpers with retry logic for transient network failures
 * and user-friendly error messages for common Firebase Auth errors.
 */

import type { Auth } from "firebase/auth";

const NETWORK_RETRY_ATTEMPTS = 2;
const NETWORK_RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  const message = (err as { message?: string })?.message ?? "";
  return (
    code === "auth/network-request-failed" ||
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("fetch")
  );
}

export function getAuthErrorMessage(
  errorCode: string | undefined,
  fallback: string,
  context: "signup" | "login" | "reset"
): string {
  if (errorCode === "auth/network-request-failed") {
    return [
      "Network error connecting to Firebase. Try again in a moment.",
      "If this persists: Google Cloud Console → APIs & Services → Credentials → your API key → ensure your app domain (e.g. cadence-indol.vercel.app) is in HTTP referrer restrictions, or temporarily remove restrictions to test.",
    ].join(" ");
  }
  if (errorCode === "auth/requests-from-referer-are-blocked") {
    return "Your domain is not allowed. Add this site's URL to your Firebase API key restrictions in Google Cloud Console.";
  }
  if (errorCode === "auth/invalid-api-key" || errorCode === "auth/api-key-not-valid") {
    return "Firebase API key is invalid. Check public/firebase-config.json and Google Cloud Console.";
  }
  if (errorCode === "auth/unauthorized-domain") {
    return "This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.";
  }

  // Context-specific messages
  if (context === "signup") {
    if (errorCode === "auth/email-already-in-use") return "An account with this email already exists. Please sign in instead.";
    if (errorCode === "auth/invalid-email") return "Invalid email address.";
    if (errorCode === "auth/weak-password") return "Password is too weak. Please choose a stronger password.";
    if (errorCode === "auth/operation-not-allowed") return "Email/password sign-up is not enabled. Please contact support.";
  }
  if (context === "login") {
    if (errorCode === "auth/user-not-found") return "No account found with this email address.";
    if (errorCode === "auth/wrong-password") return "Incorrect password. Try again or reset your password.";
    if (errorCode === "auth/invalid-email") return "Invalid email address.";
    if (errorCode === "auth/user-disabled") return "This account has been disabled.";
    if (errorCode === "auth/too-many-requests") return "Too many failed attempts. Please try again later or reset your password.";
  }
  if (context === "reset") {
    if (errorCode === "auth/user-not-found") return "No account found with this email address.";
    if (errorCode === "auth/invalid-email") return "Invalid email address.";
  }

  return fallback;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = NETWORK_RETRY_ATTEMPTS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries && isNetworkError(err)) {
        await delay(NETWORK_RETRY_DELAY_MS * (attempt + 1));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

export async function signUpWithRetry(
  auth: Auth,
  email: string,
  password: string
) {
  const { createUserWithEmailAndPassword } = await import("firebase/auth");
  return withRetry(() => createUserWithEmailAndPassword(auth, email, password));
}

export async function signInWithRetry(
  auth: Auth,
  email: string,
  password: string
) {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return withRetry(() => signInWithEmailAndPassword(auth, email, password));
}

export async function sendPasswordResetWithRetry(auth: Auth, email: string) {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  return withRetry(() => sendPasswordResetEmail(auth, email));
}
