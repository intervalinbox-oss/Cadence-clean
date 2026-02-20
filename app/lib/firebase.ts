/**
 * Firebase is initialized only in the browser. Config can come from build-time env
 * or at runtime from /api/firebase-config (so Vercel env vars work even when not inlined).
 */
type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let _auth: import("firebase/auth").Auth | null = null;
let _db: import("firebase/firestore").Firestore | null = null;

const stubMessage =
  "Firebase is not initialized. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set in Vercel and reload.";

const authProxy = new Proxy({} as import("firebase/auth").Auth, {
  get(_, prop) {
    if (_auth != null) {
      const val = (_auth as unknown as Record<string | symbol, unknown>)[prop];
      return typeof val === "function" ? (val as Function).bind(_auth) : val;
    }
    throw new Error(stubMessage);
  },
});
const dbProxy = new Proxy({} as import("firebase/firestore").Firestore, {
  get(_, prop) {
    if (_db != null) {
      const val = (_db as unknown as Record<string | symbol, unknown>)[prop];
      return typeof val === "function" ? (val as Function).bind(_db) : val;
    }
    throw new Error(stubMessage);
  },
});

export const auth = authProxy;
export const db = dbProxy;

/** Returns the real Auth instance (not the proxy). Use this when passing auth to Firebase SDK functions like signInWithPopup, signInWithEmailAndPassword, etc. */
export function getAuthInstance(): import("firebase/auth").Auth {
  if (_auth == null) throw new Error(stubMessage);
  return _auth;
}

/** Call from the client after fetching config (e.g. from /api/firebase-config) to init Firebase. */
export async function initializeFirebaseFromConfig(config: FirebaseConfig): Promise<void> {
  if (typeof window === "undefined") return;
  if (_auth != null && _db != null) return;
  if (!config.apiKey?.trim()) return;
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const { getFirestore } = await import("firebase/firestore");
  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  _auth = getAuth(app);
  _db = getFirestore(app);
}
