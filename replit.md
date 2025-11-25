# Text Momentum - Replit Project

## Overview
Text Momentum is a mobile-first habit-building app with AI coaching, social accountability, and calendar integration. This is a Next.js 15 application using TypeScript, Tailwind CSS, and OpenAI for AI chat functionality.

## Recent Changes
- **2024-11-25**: Imported from GitHub and configured for Replit environment
  - Configured Next.js to allow all hosts for Replit proxy
  - Set up workflow for Next.js dev server on port 5000
  - Ready for environment variable configuration

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Vercel AI SDK + OpenAI (gpt-4o-mini)
- **Auth**: Firebase Auth with Google OAuth
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Key Directories
- `app/` - Next.js App Router pages and API routes
  - `api/chat/route.ts` - Chat API endpoint using ChatService
  - `page.tsx` - Landing page with chat modal
- `lib/` - Shared libraries and services
  - `services/` - Business logic layer (service pattern)
  - `firebase/` - Firebase configuration and auth
  - `contexts/` - React contexts
- `components/` - React components
  - `auth/` - Authentication components

### Service Layer Pattern
The app uses a clean service layer architecture:
- API routes are thin controllers
- All business logic lives in `lib/services/`
- Easy to test and scale

## Environment Setup

### Required Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for chat functionality (required)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase configuration (optional for auth)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

## Replit Configuration

### Workflow
- **Next.js Dev Server**: Runs on port 5000 with host 0.0.0.0
- Command: `npm run dev -- -p 5000 -H 0.0.0.0`
- The app is configured to allow all hosts for Replit's proxy

### Deployment
- When ready to deploy, the app should use `npm run build` and `npm start`
- Production server should run on port 5000

## Current Features (MVP)
- Landing page with glassmorphic design
- AI chat modal with streaming responses
- Service architecture for scalability
- Type-safe TypeScript implementation
- Firebase Auth setup (requires configuration)

## Planned Features
- Google Calendar integration
- Social features (friend matching, groups)
- SMS check-ins via Twilio
- Goal tracking and CRUD operations

## Development Notes
- Mobile-first responsive design
- Server Components by default
- Clean separation of concerns
- No mock data - uses real APIs

## User Preferences
- None documented yet
