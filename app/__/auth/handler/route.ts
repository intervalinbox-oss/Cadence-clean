/**
 * Firebase Auth handler proxy route.
 * Firebase's signInWithPopup requires a /__/auth/handler endpoint on the authDomain.
 * This proxies requests to the real Firebase auth handler at firebaseapp.com.
 */
import { NextRequest, NextResponse } from "next/server";

const FIREBASE_AUTH_HANDLER = "https://cadence-956b5.firebaseapp.com/__/auth/handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.toString();
  const url = params ? `${FIREBASE_AUTH_HANDLER}?${params}` : FIREBASE_AUTH_HANDLER;

  const response = await fetch(url, {
    headers: {
      "User-Agent": request.headers.get("user-agent") || "",
    },
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "text/html",
      "Cache-Control": "no-store",
    },
  });
}
