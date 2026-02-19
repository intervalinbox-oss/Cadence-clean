/**
 * Auth helpers with retry logic, server-side proxy fallback for network failures,
 * and user-friendly error messages.
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
      "Your browser cannot reach Firebase (often caused by ad blockers, firewalls, or VPN).",
      "Try: disable ad blockers for this site, use incognito mode, or a different network.",
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
    if (errorCode === "auth/invalid-credential" || errorCode === "auth/account-exists-with-different-credential")
      return "This account was created with Google sign-in. Email/password is not available. Please contact support to recover access.";
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

type ProxyResult = { customToken: string } | { error: string; code?: string } | null;

async function signUpViaProxy(email: string, password: string): Promise<ProxyResult> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as { customToken?: string; error?: string; code?: string } | null;
  if (res.ok && data?.customToken) return { customToken: data.customToken };
  if (data?.error) return { error: data.error, code: data.code };
  return null;
}

async function signInViaProxy(email: string, password: string): Promise<ProxyResult> {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as { customToken?: string; error?: string; code?: string } | null;
  if (res.ok && data?.customToken) return { customToken: data.customToken };
  if (data?.error) return { error: data.error, code: data.code };
  return null;
}

export async function signUpWithRetry(
  auth: Auth,
  email: string,
  password: string
) {
  const { createUserWithEmailAndPassword, signInWithCustomToken } = await import("firebase/auth");
  try {
    return await withRetry(() => createUserWithEmailAndPassword(auth, email, password));
  } catch (err) {
    if (isNetworkError(err)) {
      const proxy = await signUpViaProxy(email, password);
      if (proxy && "customToken" in proxy) {
        return signInWithCustomToken(auth, proxy.customToken);
      }
      if (proxy && "error" in proxy) {
        const e = new Error(proxy.error) as Error & { code?: string };
        e.code = proxy.code;
        throw e;
      }
    }
    throw err;
  }
}

export async function signInWithRetry(
  auth: Auth,
  email: string,
  password: string
) {
  const { signInWithEmailAndPassword, signInWithCustomToken } = await import("firebase/auth");
  try {
    return await withRetry(() => signInWithEmailAndPassword(auth, email, password));
  } catch (err) {
    if (isNetworkError(err)) {
      const proxy = await signInViaProxy(email, password);
      if (proxy && "customToken" in proxy) {
        // #region agent log
        if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7242/ingest/c3ffbf4b-2e94-4f0e-98bd-ef087cba20e6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authHelpers.ts:signInWithRetry:proxy',message:'Using proxy, calling signInWithCustomToken',data:{},hypothesisId:'H4',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return signInWithCustomToken(auth, proxy.customToken);
      }
      if (proxy && "error" in proxy) {
        const e = new Error(proxy.error) as Error & { code?: string };
        e.code = proxy.code;
        throw e;
      }
    }
    throw err;
  }
}

export async function sendPasswordResetWithRetry(auth: Auth, email: string) {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  return withRetry(() => sendPasswordResetEmail(auth, email));
}
