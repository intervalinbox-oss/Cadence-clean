# Cadence MVP Testing & Deployment Checklist

## ✅ Phase 1: Local Testing & Debugging

### 1.1 Environment Setup
**Run these commands in your terminal:**

```bash
# Navigate to project
cd /Users/StephanieRogers/cadence-clean

# Install frontend dependencies (if needed)
npm install

# Install backend dependencies
cd functions
npm install
cd ..

# Create .env.local file (copy from .env.example if it exists)
# Add your Firebase configuration values
```

**Checklist:**
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] Firebase connection works (can see login page)
- [ ] No console errors on page load

---

### 1.2 Frontend Testing

**Test each flow manually:**

#### Navigation
- [ ] Home page loads
- [ ] Top navigation displays correctly
- [ ] All nav links work (Home, Start cadence, Dashboard, History)
- [ ] Logout button works

#### Mode Selection
- [ ] Mode selection screen displays
- [ ] Quick Mode card is clickable
- [ ] Full Wizard card is clickable
- [ ] Progress indicator shows

#### Quick Mode
- [ ] All 5 questions display
- [ ] Form validation works (submit disabled until required fields filled)
- [ ] Can fill all fields
- [ ] "Get my recommendation" button enables when ready
- [ ] Progress indicator updates

#### Full Wizard
- [ ] Step 1 (Context) displays correctly
- [ ] Can navigate between steps (Back/Continue)
- [ ] Progress indicator shows correct step (1 of 4, 2 of 4, etc.)
- [ ] Step 2 (Timing) - Decision type multi-select works
- [ ] Step 3 (Stakeholders) - All fields work
- [ ] Step 4 (Sensitivity) - All dropdowns work
- [ ] Can complete all 4 steps

#### Summary/Recommendation Page
- [ ] Recommendation displays (Meeting/Email/Async)
- [ ] Confidence score shows
- [ ] Time saved banner displays (if applicable)
- [ ] "Why Cadence chose this" section shows factors
- [ ] Meeting metadata cards show (if meeting recommended)
- [ ] Content generation loading state works
- [ ] Generated content displays (agenda/email/async message)
- [ ] Can edit generated content
- [ ] Copy button works
- [ ] Regenerate button works
- [ ] "Save to History" button works

#### Decision Detail Page
- [ ] Page loads after saving
- [ ] All decision data displays correctly
- [ ] Generated content shows
- [ ] Can edit content
- [ ] Copy buttons work
- [ ] Back to History link works

#### History Page
- [ ] Saved decisions appear as cards
- [ ] Search functionality works
- [ ] Filters work (type, urgency)
- [ ] Cards display all metadata
- [ ] Can click to view decision detail

#### Dashboard
- [ ] All 7 sections load
- [ ] Metrics grid shows data
- [ ] Time saved chart renders
- [ ] Communication breakdown chart renders
- [ ] Urgency/Tone/Sensitivity distributions show
- [ ] Insights list displays
- [ ] Activity timeline shows decisions

**Exit Criteria:**
- [ ] All user flows work end-to-end
- [ ] No console errors
- [ ] All pages render correctly

---

### 1.3 Backend Testing (Firebase Functions)

**Setup:**
```bash
cd functions

# Create .env file for local testing
echo "CLAUDE_API_KEY=your_claude_api_key_here" > .env

# Test locally with emulators (optional)
firebase emulators:start --only functions
```

**Test Endpoints (use Postman, curl, or browser):**

1. **Health Check** (no auth required):
   ```bash
   curl https://us-central1-your-project.cloudfunctions.net/api/health
   ```
   - [ ] Returns 200
   - [ ] Returns `{"status":"ok",...}`

2. **Generate Endpoint** (requires auth):
   ```bash
   # Without token - should fail
   curl -X POST https://us-central1-your-project.cloudfunctions.net/api/generate
   ```
   - [ ] Returns 401 Unauthorized

   ```bash
   # With valid token (get from browser after login)
   curl -X POST https://us-central1-your-project.cloudfunctions.net/api/generate \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"inputs": {...}, "rulesResult": {...}}'
   ```
   - [ ] Returns 200
   - [ ] Returns generated content

3. **Save Endpoint**:
   ```bash
   curl -X POST https://us-central1-your-project.cloudfunctions.net/api/save \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"decisionData": {...}, "timeSavedMinutes": 30}'
   ```
   - [ ] Returns 200
   - [ ] Decision appears in Firestore

4. **Dashboard Endpoint**:
   ```bash
   curl https://us-central1-your-project.cloudfunctions.net/api/dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - [ ] Returns 200
   - [ ] Returns metrics data

5. **Insights Endpoint**:
   ```bash
   curl https://us-central1-your-project.cloudfunctions.net/api/dashboard/insights \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - [ ] Returns 200
   - [ ] Returns insights array

**Exit Criteria:**
- [ ] All endpoints respond correctly
- [ ] Auth middleware works
- [ ] Content generation works
- [ ] Data saves correctly

---

### 1.4 Integration Testing

**Complete User Flows:**

1. **Quick Mode Flow:**
   - [ ] Select Quick Mode
   - [ ] Fill all 5 questions
   - [ ] Submit → Recommendation shows
   - [ ] Content generates
   - [ ] Save to History
   - [ ] Verify appears in History
   - [ ] Click to view detail page

2. **Full Wizard Flow:**
   - [ ] Select Full Wizard
   - [ ] Complete all 4 steps
   - [ ] Submit → Recommendation shows
   - [ ] Content generates
   - [ ] Save to History
   - [ ] Verify appears in History

3. **Dashboard Flow:**
   - [ ] Create 3-5 decisions
   - [ ] Go to Dashboard
   - [ ] Verify metrics update
   - [ ] Verify charts show data
   - [ ] Verify insights generate

4. **Error Handling:**
   - [ ] Test with invalid auth (should redirect to login)
   - [ ] Test with missing required fields (validation should prevent submit)
   - [ ] Test network error (should show error message)

**Exit Criteria:**
- [ ] All integration flows work
- [ ] Error handling works gracefully
- [ ] Data persists correctly

---

## ✅ Phase 2: QA Validation

### 2.1 Accessibility Audit (WCAG 2.2 AA)

**Tools to Use:**
- WAVE browser extension
- axe DevTools
- Lighthouse accessibility audit
- Manual keyboard testing

**Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all focusable elements
- [ ] All images/icons have alt text or aria-labels
- [ ] Color contrast meets 3:1 minimum (test with contrast checker)
- [ ] Forms have proper labels and error messages
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver) - can navigate entire app
- [ ] Keyboard-only navigation works throughout app

**Exit Criteria:**
- [ ] All accessibility checks pass
- [ ] Screen reader compatible
- [ ] Keyboard navigation works

---

### 2.2 Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Test Areas:**
- [ ] Layout renders correctly
- [ ] Interactions work
- [ ] Forms submit correctly
- [ ] Navigation works

---

### 2.3 Responsive Design Testing

**Breakpoints to Test:**
- [ ] Mobile (320px - 640px)
- [ ] Tablet (641px - 1024px)
- [ ] Desktop (1025px+)
- [ ] Large desktop (1440px+)

**Test Areas:**
- [ ] Navigation adapts correctly
- [ ] Forms are usable on mobile
- [ ] Cards stack properly
- [ ] Text is readable
- [ ] Buttons are tappable (44x44px minimum)

---

### 2.4 Performance Testing

**Run Lighthouse Audit:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for Performance, Accessibility, Best Practices, SEO

**Targets:**
- [ ] Performance score > 90
- [ ] Page load time < 2 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] No layout shifts (CLS < 0.1)

---

## ✅ Phase 3: Pre-Deployment Setup

### 3.1 Firebase Configuration

**Tasks:**
1. [ ] Verify Firebase project exists
2. [ ] Enable Authentication (Email/Password)
3. [ ] Enable Firestore Database
4. [ ] Enable Cloud Functions
5. [ ] Deploy Firestore security rules

**Commands:**
```bash
# Verify Firebase project
firebase projects:list

# Set active project
firebase use your-project-id

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

### 3.2 Environment Variables Setup

**Frontend (Vercel):**
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` (set after backend deploy)

**Backend (Firebase Functions):**
```bash
# Set Claude API key
firebase functions:config:set claude.api_key="your_claude_api_key_here"

# Verify config
firebase functions:config:get
```

---

## ✅ Phase 4: Deployment

### 4.1 Backend Deployment

**Steps:**
```bash
cd functions

# Deploy functions
firebase deploy --only functions
```

**After deployment:**
- [ ] Check Firebase Console → Functions (should show deployed function)
- [ ] Test health endpoint: `https://us-central1-your-project.cloudfunctions.net/api/health`
- [ ] Copy function URL: `https://us-central1-{project-id}.cloudfunctions.net/api`

---

### 4.2 Frontend Deployment

**Steps:**
1. [ ] Connect GitHub repo to Vercel
2. [ ] Add all environment variables in Vercel dashboard
3. [ ] Set `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` with deployed function URL
4. [ ] Push to main branch (auto-deploys) OR manually trigger deployment

**Verify:**
- [ ] Deployment succeeds
- [ ] App loads on production URL
- [ ] Authentication works
- [ ] Core features functional

---

### 4.3 Post-Deployment Verification

**Checklist:**
- [ ] Homepage loads
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Can create decision (Quick Mode)
- [ ] Can create decision (Full Wizard)
- [ ] Content generation works
- [ ] Can save decision
- [ ] Decision appears in history
- [ ] Decision detail page works
- [ ] Dashboard loads and shows data
- [ ] All API endpoints work
- [ ] No console errors
- [ ] Mobile responsive

---

## Common Issues & Quick Fixes

### Issue: Functions deployment fails
- Check Node.js version (should be 18)
- Verify all dependencies installed in functions/
- Check Firebase CLI is logged in: `firebase login`
- Review deployment logs

### Issue: Content generation not working
- Verify `CLAUDE_API_KEY` is set: `firebase functions:config:get`
- Check API key is valid
- Review function logs: `firebase functions:log`
- Verify API quota not exceeded

### Issue: Frontend can't connect to backend
- Verify `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` is set correctly in Vercel
- Check CORS configuration in functions/src/api.js
- Verify function URL is accessible (test health endpoint)
- Check browser console for CORS errors

### Issue: Authentication not working
- Verify Firebase Auth is enabled in Firebase Console
- Check authorized domains in Firebase Console → Authentication → Settings
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel
- Check browser console for auth errors

---

## Next Steps After Testing

Once all testing is complete:
1. Fix any issues found
2. Deploy to production
3. Set up monitoring (Sentry, analytics, etc.)
4. Monitor for errors and performance issues
