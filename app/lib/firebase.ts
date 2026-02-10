/**
 * Firebase is loaded only in the browser (via require inside ensureInitialized).
 * No top-level imports from "firebase/*" so the SDK is never evaluated during SSR/prerender.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

let _auth: unknown = null;
let _db: unknown = null;

function ensureInitialized(): void {
  if (_auth != null && _db != null) return;
  if (typeof window === "undefined") {
    throw new Error(
      "Firebase is only initialized in the browser. Set NEXT_PUBLIC_FIREBASE_* env vars and ensure the app runs on the client."
    );
  }
  if (!firebaseConfig.apiKey?.trim()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY and other NEXT_PUBLIC_FIREBASE_* environment variables in Vercel (or .env.local)."
    );
  }
  // Load Firebase only on the client so SSR/prerender never evaluates the SDK
  const { initializeApp } = require("firebase/app");
  const { getAuth } = require("firebase/auth");
  const { getFirestore } = require("firebase/firestore");
  const app = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
}

const authProxy = new Proxy(
  {},
  {
    get(_, prop) {
      ensureInitialized();
      return (_auth as Record<string, unknown>)[prop as string];
    },
  }
);
const dbProxy = new Proxy(
  {},
  {
    get(_, prop) {
      ensureInitialized();
      return (_db as Record<string, unknown>)[prop as string];
    },
  }
);

export const auth = authProxy as import("firebase/auth").Auth;
export const db = dbProxy as import("firebase/firestore").Firestore;
