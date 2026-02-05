# Cadence Quick Start Guide

## 🚀 Fastest Path to Deployment

### Prerequisites
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- Claude API key from Anthropic

---

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend  
cd functions && npm install && cd ..
```

### 2. Configure Firebase

```bash
# Login to Firebase
firebase login

# Set your project
firebase use your-project-id

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 3. Set Claude API Secret

```bash
# Set the secret (you'll be prompted to enter the key)
firebase functions:secrets:set CLAUDE_API_KEY
```

### 4. Deploy Backend

```bash
cd functions
firebase deploy --only functions
```

**After deployment, note your function URL:**
- Format: `https://us-central1-{project-id}.cloudfunctions.net/api`
- Test it: `curl https://us-central1-your-project.cloudfunctions.net/api/health`

### 5. Configure Vercel

1. Connect your GitHub repo to Vercel
2. Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net/api
```

### 6. Deploy Frontend

Push to main branch (Vercel auto-deploys) or:
```bash
vercel --prod
```

### 7. Verify

- [ ] Visit your Vercel URL
- [ ] Sign up/Sign in works
- [ ] Create a decision (Quick Mode)
- [ ] Content generates
- [ ] Can save decision
- [ ] Dashboard loads

---

## Testing Locally First (Recommended)

Before deploying, test locally:

```bash
# 1. Create .env.local with Firebase config
cp .env.example .env.local
# Edit .env.local with your values

# 2. Start dev server
npm run dev

# 3. Test in browser at http://localhost:3000
```

---

## Common Issues

**Functions deploy fails:**
- Check Node version: `node --version` (needs 18)
- Verify secrets: `firebase functions:secrets:access CLAUDE_API_KEY`

**Content generation fails:**
- Check function logs: `firebase functions:log --only api`
- Verify Claude API key is valid

**Frontend can't connect:**
- Verify `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` matches deployed function URL
- Check no trailing slash in URL
- Test health endpoint works

---

## Need Help?

See `TESTING_CHECKLIST.md` for detailed testing procedures.
See `DEPLOYMENT_GUIDE.md` for comprehensive deployment guide.
