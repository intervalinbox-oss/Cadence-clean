# Cadence Deployment Guide

## Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Auth, Firestore, Functions, and billing enabled
- Claude API key from Anthropic

---

## 1. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

## 2. Firebase Project Setup

```bash
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules
```

## 3. Firebase Client Config

**For production (Vercel):** Add `public/firebase-config.json` with your Firebase web app config:

1. Copy `public/firebase-config.example.json` to `public/firebase-config.json`
2. Get values from Firebase Console → Project Settings → General → Your apps → Web app
3. Fill in: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

**For local dev:** Use `.env.local` with `NEXT_PUBLIC_FIREBASE_*` (see `.env.example`).

## 4. Backend (Firebase Functions)

```bash
cd functions
firebase functions:secrets:set CLAUDE_API_KEY
firebase deploy --only functions
cd ..
```

Note the Function URL (e.g. `https://us-central1-your-project.cloudfunctions.net/api`).

## 5. Frontend Environment

**Vercel:** Project Settings → Environment Variables:
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` – your deployed function URL
- `FIREBASE_SERVICE_ACCOUNT_JSON` – (optional) Full JSON of your Firebase service account key. Enables server-side auth proxy, which bypasses client-side network blocking (ad blockers, firewalls). Get from Firebase Console → Project Settings → Service Accounts → Generate new private key. Paste the entire JSON as the value.

## 6. Firebase Auth (Google Sign-In)

The app uses `signInWithPopup` (not redirect) because `signInWithRedirect` is broken in Chrome M115+ and modern browsers due to third-party cookie blocking.

1. **Firebase Console** → Authentication → Settings → Authorized domains: add your app domain (e.g. `cadence-indol.vercel.app`, `localhost`)
2. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client ID (Web client):
   - Authorized JavaScript origins: your app URL (e.g. `https://your-app.vercel.app`, `http://localhost:3000`)
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler` (double underscore)

## 7. Deploy Frontend (Vercel)

Connect your repo to Vercel; it will auto-deploy on push. Or: `vercel --prod`.

---

## Checklist

- [ ] Firebase project configured (Auth, Firestore, Functions, billing)
- [ ] Firestore rules deployed
- [ ] `public/firebase-config.json` created (or env vars for local)
- [ ] Claude API key set in Firebase Functions
- [ ] Functions deployed
- [ ] `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` set in Vercel
- [ ] App domain in Firebase Authorized domains
- [ ] OAuth origins in Google Cloud (if using Google sign-in)
- [ ] Email/Password sign-in method enabled (Firebase Console → Authentication → Sign-in method)
- [ ] API key HTTP referrer restrictions include your domain (if using restrictions)
- [ ] Frontend deployed

---

## Troubleshooting

**Functions won't deploy:** Check Node 18, billing enabled, `firebase login`.

**Content generation fails:** Verify `CLAUDE_API_KEY` secret; check `firebase functions:log`.

**Auth / "Configuration needed":** Ensure `public/firebase-config.json` exists and has valid `apiKey` and `projectId`.

**Google sign-in "unauthorized-domain":** Add your exact domain to Firebase Authorized domains and Google Cloud Authorized JavaScript origins.

**Auth "network-request-failed":** Often caused by ad blockers blocking `identitytoolkit.googleapis.com`, or firewalls/VPN. Fixes:
1. **Server-side proxy (recommended):** Add `FIREBASE_SERVICE_ACCOUNT_JSON` to Vercel env (see step 5). The app will automatically use a server-side auth proxy when the client cannot reach Firebase.
2. **Disable ad blockers** for your app domain.
3. **Try incognito** or a different network (e.g. mobile hotspot).

**Auth "requests-from-referer-are-blocked":** Add your app domain to API key HTTP referrer restrictions in Google Cloud Console, or set restrictions to "None".
