# Cadence - Communication Decision Engine

An AI-powered communication decision support system that recommends the optimal communication method (meeting, email, or async message) and generates ready-to-use content for executives.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Firebase Cloud Functions (Express REST API)
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **AI**: Claude 3 Sonnet (via Anthropic API)
- **Hosting**: Vercel (frontend), Firebase (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI
- Firebase project with Firestore and Functions enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration
   - Set `NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL` after deploying functions

4. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```
   Select: Firestore, Functions

5. Set Firebase Functions environment variables:
   ```bash
   firebase functions:config:set claude.api_key="your_claude_api_key"
   ```

### Development

1. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

2. (Optional) Start Firebase emulators:
   ```bash
   firebase emulators:start
   ```

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide, including Firebase config, Auth setup, and Vercel deployment.

## Project Structure

```
/app
  /components        # React components
    /ui              # Reusable UI components
    /dashboard       # Dashboard-specific components
    /charts          # Chart components
  /new-decision   # Decision wizard (Quick Mode & Full Wizard)
  /dashboard         # Analytics dashboard
  /history           # Decision history
  /decision/[id]     # Decision detail page
  /lib               # Utilities (Firebase, API client, RulesEngine)
/functions           # Firebase Cloud Functions
  /src
    /api.js          # Express app
    /generate.js     # Claude integration
    /dashboard.js    # Dashboard endpoints
    /saveDecision.js # Save decision endpoint
```

## Features

- **Quick Mode**: 5 essential questions for fast recommendations
- **Full Wizard**: Comprehensive 4-step questionnaire
- **AI Content Generation**: Automatically generates meeting agendas, emails, and async messages
- **Analytics Dashboard**: Track decisions, time saved, and communication patterns
- **Decision History**: Searchable archive of past decisions
- **WCAG 2.2 AA Compliant**: Fully accessible interface

## Environment Variables

See `.env.example` for required environment variables.

## License

Private - All rights reserved
