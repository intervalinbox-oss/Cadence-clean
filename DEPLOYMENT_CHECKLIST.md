# Cadence Deployment Checklist

## Pre-Deployment: Environment Setup

### 1. Firebase Project Configuration
- [ ] Firebase project created: `cadence-956b5` (or your project ID)
- [ ] Authentication enabled (Email/Password method)
- [ ] Firestore Database created
- [ ] Cloud Functions enabled
- [ ] Billing enabled (required for Functions)

**Commands**:
```bash
# Verify project
firebase projects:list
firebase use cadence-956b5  # or your project ID
```

### 2. Firestore Security Rules
- [ ] Rules deployed: `firebase deploy --only firestore:rules`
- [ ] Rules tested in Firebase Console
- [ ] Users collection access verified
- [ ] Decisions collection access verified

### 3. Environment Variables - Frontend (Vercel)

Create these in Vercel → Project Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - `{project-id}.firebaseapp.com`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your project ID
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - `{project-id}.appspot.com`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` - Set AFTER backend deploy (see step 5)

**Where to find**: Firebase Console → Project Settings → General → Your apps → Web app config

### 4. Environment Variables - Backend (Firebase Functions)

**Option A: Using Secrets (Recommended for v2)**
```bash
cd functions
firebase functions:secrets:set CLAUDE_API_KEY
# When prompted, paste your Claude API key
```

**Option B: Using Config (Legacy, but works)**
```bash
cd functions
firebase functions:config:set claude.api_key="your_claude_api_key_here"
```

**Verify**:
```bash
firebase functions:config:get
# or for secrets:
firebase functions:secrets:access CLAUDE_API_KEY
```

### 5. Claude API Key Setup
- [ ] Get API key from Anthropic Console: https://console.anthropic.com/
- [ ] Add to Firebase Functions (see step 4)
- [ ] Test API key works (optional: test locally first)
- [ ] Understand API pricing and quotas

---

## Deployment: Backend (Firebase Functions)

### Step 1: Install Functions Dependencies
```bash
cd functions
npm install
cd ..
```

### Step 2: Test Functions Locally (Optional)
```bash
cd functions
firebase emulators:start --only functions
# Test health endpoint in another terminal:
# curl http://localhost:5001/cadence-956b5/us-central1/api/health
```

### Step 3: Deploy Functions
```bash
cd functions
firebase deploy --only functions
```

**Expected Output**:
```
✔  functions[api(us-central1)] Successful create operation.
Function URL: https://us-central1-cadence-956b5.cloudfunctions.net/api
```

### Step 4: Verify Deployment
- [ ] Check Firebase Console → Functions → See deployed function
- [ ] Test health endpoint:
  ```bash
  curl https://us-central1-{project-id}.cloudfunctions.net/api/health
  ```
  Should return: `{"status":"ok","timestamp":"..."}`

### Step 5: Update Frontend Environment Variable
- [ ] Copy the Function URL from step 3
- [ ] In Vercel, add/update: `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL`
- [ ] Value: `https://us-central1-{project-id}.cloudfunctions.net/api`

---

## Deployment: Frontend (Vercel)

### Option A: GitHub Auto-Deploy (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Configure:
     - Framework Preset: **Next.js**
     - Build Command: `npm run build`
     - Output Directory: `.next` (default)
     - Install Command: `npm install`

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` variables (see Pre-Deployment step 3)
   - **Important**: Include `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL`

4. **Deploy**:
   - Vercel will auto-deploy on push
   - Or click "Deploy" in Vercel dashboard

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to link project and set environment variables
```

---

## Post-Deployment Verification

### Critical Path Testing

1. **Homepage**
   - [ ] Loads without errors
   - [ ] Navigation visible
   - [ ] No console errors

2. **Authentication**
   - [ ] Can sign up new account
   - [ ] Can sign in existing account
   - [ ] Can sign out
   - [ ] Protected routes redirect if not logged in

3. **Decision Creation (Quick Mode)**
   - [ ] Navigate to "Start a new cadence"
   - [ ] Mode selection displays
   - [ ] Select "Quick Mode"
   - [ ] Fill all 5 questions
   - [ ] Click "Get my recommendation"
   - [ ] Recommendation displays
   - [ ] Content generates (wait 5-10 seconds)
   - [ ] Can edit generated content
   - [ ] Click "Save to History"
   - [ ] Redirects to decision detail page

4. **Decision Creation (Full Wizard)**
   - [ ] Select "Full Wizard"
   - [ ] Complete Step 1 (Context)
   - [ ] Complete Step 2 (Timing)
   - [ ] Complete Step 3 (Stakeholders)
   - [ ] Complete Step 4 (Sensitivity)
   - [ ] Click "Get my recommendation"
   - [ ] Verify recommendation and content

5. **Decision Detail Page**
   - [ ] All data displays correctly
   - [ ] Generated content visible
   - [ ] Can copy content
   - [ ] Can edit content
   - [ ] No re-computation (check Network tab)

6. **History Page**
   - [ ] Saved decisions appear
   - [ ] Search works
   - [ ] Filters work (type, urgency)
   - [ ] Can click on decision cards

7. **Dashboard**
   - [ ] All 7 sections load
   - [ ] Metrics display correctly
   - [ ] Charts render
   - [ ] Insights appear
   - [ ] Activity timeline shows decisions

8. **API Endpoints** (Test via browser Network tab or Postman)
   - [ ] `GET /health` - Returns 200
   - [ ] `POST /generate` - Requires auth, returns content
   - [ ] `POST /save` - Saves to Firestore
   - [ ] `GET /dashboard` - Returns metrics
   - [ ] `GET /dashboard/insights` - Returns insights
   - [ ] `GET /dashboard/streaks` - Returns streaks

---

## Monitoring Setup

### Error Tracking
- [ ] Set up Sentry (recommended) or similar
- [ ] Configure error alerts
- [ ] Test error reporting

### Analytics
- [ ] Set up Vercel Analytics
- [ ] Or Google Analytics
- [ ] Track key events (decisions created, etc.)

### Performance Monitoring
- [ ] Vercel Analytics enabled
- [ ] Firebase Performance Monitoring (optional)
- [ ] Set up performance alerts

---

## Troubleshooting

### Functions Not Deploying
**Check**:
- Node.js version (should be 18)
- All dependencies installed
- Firebase CLI logged in: `firebase login`
- Billing enabled on Firebase project

### Content Generation Failing
**Check**:
- Claude API key set correctly
- API key is valid (test in Anthropic console)
- API quota not exceeded
- Check Functions logs: `firebase functions:log`

### Frontend Can't Connect to Backend
**Check**:
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` set correctly
- URL matches deployed function URL exactly
- CORS enabled in functions (already done)
- Check browser console for CORS errors

### Authentication Not Working
**Check**:
- Firebase Auth enabled
- Authorized domains in Firebase Console include your Vercel domain
- Environment variables set correctly
- Check browser console for auth errors

---

## Success Criteria

✅ All features work in production
✅ No console errors
✅ Performance acceptable (< 2s page load)
✅ Mobile responsive
✅ Accessibility compliant
✅ Monitoring set up

---

## Quick Reference: Deployment Commands

```bash
# 1. Deploy Firestore rules
firebase deploy --only firestore:rules

# 2. Set Claude API key (secrets - recommended)
cd functions
firebase functions:secrets:set CLAUDE_API_KEY

# 3. Deploy Functions
firebase deploy --only functions

# 4. Get Function URL (from deploy output or)
# Firebase Console → Functions → api → Copy URL

# 5. Update Vercel env var: NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL

# 6. Deploy Frontend (auto via GitHub or)
vercel --prod
```
