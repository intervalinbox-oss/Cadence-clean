# Cadence Testing & Deployment Guide

## Quick Start Testing

Due to system permission constraints, you'll need to run these commands in your terminal (outside of Cursor).

### Step 1: Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies  
cd functions
npm install
cd ..
```

### Step 2: Set Up Environment Variables

Create `.env.local` in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Firebase configuration:
- Get values from Firebase Console → Project Settings → General → Your apps
- Add `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` after deploying functions (see Step 5)

### Step 3: Test Local Build

```bash
# Test TypeScript compilation
npx tsc --noEmit

# Test Next.js build
npm run build

# If build succeeds, test production server
npm start
```

### Step 4: Test Development Server

```bash
npm run dev
```

Then open http://localhost:3000 and test:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Can access login/signup
- [ ] Can create account and log in

### Step 5: Test Firebase Functions Locally (Optional)

```bash
cd functions

# Set Claude API key for local testing
# Create .env file in functions/ directory:
# CLAUDE_API_KEY=your_key_here

# Start emulators
firebase emulators:start --only functions

# In another terminal, test health endpoint:
# curl http://localhost:5001/cadence-956b5/us-central1/api/health
```

### Step 6: Test Complete User Flow

1. **Sign Up/Login**
   - Create account or log in
   - Verify redirect to dashboard or home

2. **Create Decision (Quick Mode)**
   - Navigate to "Start a new cadence"
   - Select "Quick Mode"
   - Fill out all 5 questions
   - Click "Get my recommendation"
   - Verify recommendation displays
   - Verify content generation (may take 5-10 seconds)
   - Click "Save to History"
   - Verify redirect to decision detail page

3. **Create Decision (Full Wizard)**
   - Navigate to "Start a new cadence"
   - Select "Full Wizard"
   - Complete all 4 steps
   - Verify progress indicator updates
   - Click "Get my recommendation"
   - Verify recommendation and generated content
   - Save decision

4. **View History**
   - Navigate to History
   - Verify saved decisions appear
   - Test search functionality
   - Test filters (type, urgency)
   - Click on a decision card
   - Verify decision detail page loads

5. **View Dashboard**
   - Navigate to Dashboard
   - Verify all 7 sections load
   - Verify metrics display correctly
   - Verify charts render
   - Verify insights appear

6. **Decision Detail Page**
   - Click on a decision from history
   - Verify all data displays correctly
   - Verify no re-computation occurs (check network tab)
   - Test copy functionality
   - Test edit functionality

## Pre-Deployment Checklist

### Code Quality
- [x] No linter errors (verified)
- [ ] TypeScript compiles without errors
- [ ] Build succeeds locally
- [ ] All imports resolve correctly

### Environment Variables
- [ ] `.env.local` created with Firebase config
- [ ] All `NEXT_PUBLIC_*` variables set
- [ ] Firebase Functions config set (for deployment)

### Firebase Setup
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database enabled
- [ ] Cloud Functions enabled
- [ ] Firestore security rules deployed

### Claude API
- [ ] Claude API key obtained from Anthropic
- [ ] API key added to Firebase Functions config
- [ ] API quota/limits understood

## Deployment Steps

### 1. Deploy Firebase Functions

```bash
cd functions

# Set Claude API key in Firebase config
firebase functions:config:set claude.api_key="your_claude_api_key_here"

# Deploy functions
firebase deploy --only functions

# Note the deployed URL:
# https://us-central1-{project-id}.cloudfunctions.net/api
```

### 2. Update Frontend Environment Variables

In Vercel (or your hosting platform):
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` with your deployed function URL
3. Add all other `NEXT_PUBLIC_*` variables from `.env.local`

### 3. Deploy Frontend to Vercel

**Option A: Via GitHub (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-deploy on push to main

**Option B: Via Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

### 4. Post-Deployment Verification

Test in production:
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Can create decision
- [ ] Content generation works
- [ ] Can save decision
- [ ] Dashboard loads
- [ ] History works
- [ ] No console errors

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution**: Verify Firebase Auth is enabled and environment variables are set correctly.

### Issue: Content generation fails
**Solution**: 
- Check Firebase Functions logs: `firebase functions:log`
- Verify `CLAUDE_API_KEY` is set in Functions config
- Check API quota hasn't been exceeded

### Issue: CORS errors
**Solution**: Verify `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` is set correctly and matches deployed function URL.

### Issue: Functions deployment fails
**Solution**:
- Check Node.js version (should be 18)
- Verify all dependencies in `functions/package.json` are installed
- Check Firebase CLI is logged in: `firebase login`

### Issue: Build fails
**Solution**:
- Clear `.next` directory: `rm -rf .next`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

## Testing Checklist

### Frontend Testing
- [ ] Navigation works on all pages
- [ ] Mode selection displays correctly
- [ ] Quick Mode: All 5 questions work
- [ ] Full Wizard: All 4 steps work
- [ ] Progress indicators accurate
- [ ] Form validation works
- [ ] Summary page displays recommendation
- [ ] Content generation works
- [ ] Edit functionality works
- [ ] Save to History works
- [ ] Decision detail page works
- [ ] History page: search and filters work
- [ ] Dashboard: All sections load

### Backend Testing
- [ ] Health endpoint responds
- [ ] Generate endpoint: Auth required
- [ ] Generate endpoint: Returns content
- [ ] Save endpoint: Saves to Firestore
- [ ] Dashboard endpoint: Returns metrics
- [ ] Insights endpoint: Returns insights
- [ ] Streaks endpoint: Returns streak data

### Integration Testing
- [ ] Complete decision flow works
- [ ] Data persists correctly
- [ ] Error handling works
- [ ] Loading states display
- [ ] Network errors handled gracefully

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] All interactive elements accessible

### Performance
- [ ] Page load < 2 seconds
- [ ] API responses < 1 second
- [ ] No layout shifts
- [ ] Images optimized

## Next Steps After Deployment

1. Set up error monitoring (Sentry, LogRocket, etc.)
2. Set up analytics (Google Analytics, Vercel Analytics)
3. Monitor Firebase Functions usage and costs
4. Monitor Claude API usage and costs
5. Set up performance monitoring
6. Create user feedback mechanism
