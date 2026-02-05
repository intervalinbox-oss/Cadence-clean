# Cadence Deployment Guide

## Quick Deployment Steps

### Step 1: Install Dependencies

```bash
# Frontend
npm install

# Backend
cd functions
npm install
cd ..
```

### Step 2: Set Up Environment Variables

#### Frontend (.env.local)
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
# Set this AFTER deploying functions (Step 5)
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net/api
```

#### Backend (Firebase Secrets)
```bash
# Set Claude API key as a secret (Firebase Functions v2)
firebase functions:secrets:set CLAUDE_API_KEY
# When prompted, paste your Claude API key
```

### Step 3: Test Locally

```bash
# Start dev server
npm run dev

# Test build
npm run build
```

### Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Step 5: Deploy Backend (Firebase Functions)

```bash
cd functions
firebase deploy --only functions
```

**After deployment:**
- Note the function URL (format: `https://us-central1-{project-id}.cloudfunctions.net/api`)
- Test health endpoint: `curl https://us-central1-your-project.cloudfunctions.net/api/health`

### Step 6: Update Frontend Environment Variable

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add/update: `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL`
3. Value: Your deployed function URL from Step 5

### Step 7: Deploy Frontend (Vercel)

**Option A: Auto-deploy (recommended)**
- Push to main branch
- Vercel auto-deploys

**Option B: Manual deploy**
```bash
vercel --prod
```

### Step 8: Verify Deployment

- [ ] Homepage loads
- [ ] Can sign up/sign in
- [ ] Can create decision
- [ ] Content generation works
- [ ] Can save decision
- [ ] Dashboard loads
- [ ] No console errors

---

## Troubleshooting

### Functions won't deploy
- Check Node.js version: `node --version` (should be 18)
- Verify secrets are set: `firebase functions:secrets:access CLAUDE_API_KEY`
- Check Firebase CLI is logged in: `firebase login`

### Content generation fails
- Verify secret is set: `firebase functions:secrets:access CLAUDE_API_KEY`
- Check function logs: `firebase functions:log --only api`
- Verify Claude API key is valid

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` is set in Vercel
- Check function URL is correct (no trailing slash)
- Test health endpoint in browser
- Check browser console for CORS errors

### Authentication issues
- Verify Firebase Auth is enabled
- Check authorized domains in Firebase Console
- Verify all `NEXT_PUBLIC_FIREBASE_*` vars are set in Vercel

---

## Environment Variables Reference

### Required for Frontend (Vercel)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` (set after backend deploy)

### Required for Backend (Firebase Secrets)
- `CLAUDE_API_KEY` (set via `firebase functions:secrets:set`)

---

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Functions deployed successfully
- [ ] Frontend deployed successfully
- [ ] Health endpoint responds
- [ ] Authentication works
- [ ] Decision creation works
- [ ] Content generation works
- [ ] Dashboard loads
- [ ] No console errors
- [ ] Mobile responsive
