import { NextRequest, NextResponse } from "next/server";

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || "";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

async function verifyTokenAndGetUid(idToken: string): Promise<string | null> {
  if (!FIREBASE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: { localId?: string }[] };
    return data.users?.[0]?.localId ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path?.length ? path.join("/") : "";
  if (!FUNCTIONS_URL || !pathStr) {
    return NextResponse.json(
      { error: "Proxy or path not configured" },
      { status: 500 }
    );
  }
  const auth =
    _request.headers.get("Authorization") ||
    (() => {
      const t = _request.headers.get("X-Firebase-ID-Token");
      return t ? `Bearer ${t}` : null;
    })();
  const rawToken = _request.headers.get("X-Firebase-ID-Token") ?? (auth ? auth.replace(/^Bearer\s+/i, "").trim() : null);
  const baseUrl = `${FUNCTIONS_URL.replace(/\/$/, "")}/${pathStr}`;
  const useInternalAuth =
    (pathStr === "dashboard" || pathStr === "dashboard/insights") &&
    !!rawToken &&
    !!INTERNAL_API_SECRET;

  let backendUrl = baseUrl;
  let backendMethod: "GET" | "POST" = "GET";
  let backendHeaders: Record<string, string> = { "Content-Type": "application/json" };
  let backendBody: string | undefined;

  if (useInternalAuth) {
    const uid = await verifyTokenAndGetUid(rawToken!);
    if (uid) {
      backendHeaders["X-Internal-Secret"] = INTERNAL_API_SECRET;
      backendHeaders["X-Verified-Uid"] = uid;
    } else {
      backendMethod = "POST";
      backendBody = JSON.stringify({ firebase_id_token: rawToken });
    }
  } else {
    if (rawToken) backendUrl = `${baseUrl}?firebase_id_token=${encodeURIComponent(rawToken)}`;
    if (auth) backendHeaders["Authorization"] = auth;
    if (rawToken && !useInternalAuth) backendHeaders["X-Firebase-ID-Token"] = rawToken;
  }

  try {
    const res = await fetch(backendUrl, {
      method: backendMethod,
      headers: backendHeaders,
      body: backendBody,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy GET error:", err);
    return NextResponse.json(
      { error: "Could not reach Firebase Functions" },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path?.length ? path.join("/") : "";
  if (!FUNCTIONS_URL || !pathStr) {
    return NextResponse.json(
      { error: "Proxy or path not configured" },
      { status: 500 }
    );
  }
  const auth =
    request.headers.get("Authorization") ||
    (() => {
      const t = request.headers.get("X-Firebase-ID-Token");
      return t ? `Bearer ${t}` : null;
    })();
  const rawToken = request.headers.get("X-Firebase-ID-Token") ?? (auth ? auth.replace(/^Bearer\s+/i, "").trim() : null);
  const baseUrl = `${FUNCTIONS_URL.replace(/\/$/, "")}/${pathStr}`;
  const backendUrl = rawToken ? `${baseUrl}?firebase_id_token=${encodeURIComponent(rawToken)}` : baseUrl;
  const body = await request.text();
  const backendHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(auth ? { Authorization: auth } : {}),
    ...(rawToken ? { "X-Firebase-ID-Token": rawToken } : {}),
  };
  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: backendHeaders,
      body: body || undefined,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy POST error:", err);
    return NextResponse.json(
      { error: "Could not reach Firebase Functions" },
      { status: 502 }
    );
  }
}
