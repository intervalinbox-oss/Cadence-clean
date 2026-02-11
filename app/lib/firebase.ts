/**
 * Firebase is initialized only in the browser so the SDK is never run during SSR/prerender.
 * On the client we export real Auth/Firestore; on the server we export stubs that throw if used.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

let _auth: import("firebase/auth").Auth | null = null;
let _db: import("firebase/firestore").Firestore | null = null;

// Debug: in browser console you should see this; if apiKeyLen is 0, env vars weren't in the build
if (typeof window !== "undefined") {
  console.log("[Cadence] Firebase env in client: apiKeyLen=" + (firebaseConfig.apiKey?.length ?? 0) + " projectId=" + (firebaseConfig.projectId || "(empty)"));
}

if (typeof window !== "undefined" && firebaseConfig.apiKey?.trim()) {
  const { initializeApp } = require("firebase/app");
  const { getAuth } = require("firebase/auth");
  const { getFirestore } = require("firebase/firestore");
  const app = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
}

const stubMessage =
  "Firebase is not available. Set NEXT_PUBLIC_FIREBASE_* env vars and run in the browser.";
const authStub = new Proxy({} as import("firebase/auth").Auth, {
  get() {
    throw new Error(stubMessage);
  },
});
const dbStub = new Proxy({} as import("firebase/firestore").Firestore, {
  get() {
    throw new Error(stubMessage);
  },
});

export const auth = _auth ?? authStub;
export const db = _db ?? dbStub;
