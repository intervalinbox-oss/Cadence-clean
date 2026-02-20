/**
 * Firebase Auth proxy catch-all route.
 * Firebase's signInWithPopup requires /__/auth/* endpoints on the authDomain.
 * This proxies ALL Firebase auth requests to the real Firebase handlers at firebaseapp.com.
 */
import { NextRequest, NextResponse } from "next/server";

const FIREBASE_PROJECT = "cadence-956b5";
const FIREBASE_BASE = `https://${FIREBASE_PROJECT}.firebaseapp.com/__/auth`;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const url = `${FIREBASE_BASE}/${path}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "",
        "Accept": request.headers.get("accept") || "*/*",
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
  } catch (err) {
    console.error("Firebase auth proxy error:", err);
    return new NextResponse("Firebase auth proxy error", { status: 502 });
  }
}
