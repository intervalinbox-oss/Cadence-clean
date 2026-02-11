import { NextResponse } from "next/server";

/**
 * Returns Firebase client config from server env so the client can initialize
 * when NEXT_PUBLIC_* vars aren't inlined at build time (e.g. Vercel env scope).
 * Firebase API keys are public and restricted by domain in Firebase Console.
 */
export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "";
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "";

  const missing: string[] = [];
  if (!apiKey?.trim()) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!projectId?.trim()) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (missing.length > 0) {
    // Diagnostic: which Firebase env keys exist at runtime (names only)
    const present = Object.keys(process.env).filter(
      (k) => k.startsWith("NEXT_PUBLIC_FIREBASE_")
    );
    return NextResponse.json(
      {
        error: "Firebase config not configured on server",
        missing,
        present,
        hint: "In Vercel, set each variable for Production (and Preview). Ensure 'Runtime' is checked so API routes see them. Then redeploy.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });
}
