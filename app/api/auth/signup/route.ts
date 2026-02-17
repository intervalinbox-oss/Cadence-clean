/**
 * Server-side signup proxy. Bypasses client-side network blocking (ad blockers,
 * firewalls) by making the Firebase request from the Vercel server.
 */
import { NextRequest, NextResponse } from "next/server";

const IDENTITY_TOOLKIT = "https://identitytoolkit.googleapis.com/v1/accounts:signUp";

import { getFirebaseApiKey } from "../getFirebaseConfig";

export async function POST(request: NextRequest) {
  const apiKey = getFirebaseApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Firebase API key not configured" },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { email, password } = body;
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return NextResponse.json(
      { error: "email and password required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${IDENTITY_TOOLKIT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        returnSecureToken: true,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string }; localId?: string };

    if (!res.ok) {
      const errMsg = data.error?.message || "Sign up failed";
      const errCode = mapRestErrorToCode(errMsg);
      return NextResponse.json(
        { error: errMsg, code: errCode },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    const customToken = await createCustomToken(data.localId || "");
    if (!customToken) {
      return NextResponse.json(
        {
          error: "Account created but sign-in failed. Try signing in on the login page.",
          fallback: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ customToken });
  } catch (err) {
    console.error("Auth signup proxy error:", err);
    return NextResponse.json(
      { error: "Server could not reach Firebase" },
      { status: 502 }
    );
  }
}

function mapRestErrorToCode(msg: string): string {
  if (msg.includes("EMAIL_EXISTS")) return "auth/email-already-in-use";
  if (msg.includes("INVALID_EMAIL")) return "auth/invalid-email";
  if (msg.includes("WEAK_PASSWORD")) return "auth/weak-password";
  if (msg.includes("OPERATION_NOT_ALLOWED")) return "auth/operation-not-allowed";
  return msg;
}

async function createCustomToken(uid: string): Promise<string | null> {
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJson) return null;

  try {
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");

    const sa = JSON.parse(saJson) as Record<string, string>;
    if (!getApps().length) {
      initializeApp({ credential: cert(sa) });
    }
    const customToken = await getAuth().createCustomToken(uid);
    return customToken;
  } catch {
    return null;
  }
}
