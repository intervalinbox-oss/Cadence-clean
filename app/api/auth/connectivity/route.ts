/**
 * Tests whether the server can reach Firebase Identity Toolkit.
 * Helps diagnose auth/network-request-failed: if this succeeds, the issue
 * is client-side (ad blocker, firewall, etc.).
 */
import { NextResponse } from "next/server";

const IDENTITY_TOOLKIT = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

import { getFirebaseApiKey } from "../getFirebaseConfig";

export async function GET() {
  const apiKey = getFirebaseApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, reason: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${IDENTITY_TOOLKIT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "test" }),
    });
    const data = await res.json().catch(() => ({}));
    const errMsg = (data as { error?: { message?: string } })?.error?.message ?? "";

    if (res.ok) {
      return NextResponse.json({ ok: true, message: "Server can reach Firebase" });
    }
    if (errMsg.includes("INVALID_ID_TOKEN") || errMsg.includes("invalid")) {
      return NextResponse.json({
        ok: true,
        message: "Server can reach Firebase (invalid token test is expected)",
      });
    }
    return NextResponse.json({
      ok: false,
      reason: errMsg || `HTTP ${res.status}`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        reason: err instanceof Error ? err.message : "Connection failed",
      },
      { status: 502 }
    );
  }
}
