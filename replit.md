# Text Momentum - Replit Project

## Overview
Text Momentum is a mobile-first habit-building app with AI coaching, social accountability, and calendar integration. This is a Next.js 15 application using TypeScript, Tailwind CSS, and OpenAI for AI chat functionality.

## Recent Changes
- **2025-11-25**: Implemented Google Calendar integration with AI tools
  - Created HabitParser service for LLM-assisted habit extraction from conversations
  - Integrated createCalendarEvent and getUpcomingEvents tools into ChatService
  - Added timezone-aware date handling for schedule calculations
  - Updated system prompt to guide habit scheduling workflows
  - Changed chat API runtime to nodejs for googleapis compatibility
  - Installed date-fns-tz for timezone handling

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
- **Calendar**: Google Calendar API via Replit Connector
- **Date/Timezone**: date-fns + date-fns-tz
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Key Directories
- `app/` - Next.js App Router pages and API routes
  - `api/chat/route.ts` - Chat API endpoint using ChatService (nodejs runtime)
  - `page.tsx` - Landing page with chat modal
- `lib/` - Shared libraries and services
  - `services/` - Business logic layer (service pattern)
    - `chat-service.ts` - AI chat with tool integration
    - `calendar/` - Calendar integration
      - `google-calendar-service.ts` - Google Calendar API wrapper
    - `habits/` - Habit extraction services
      - `habit-types.ts` - TypeScript interfaces for habits and calendar events
      - `habit-parser.ts` - LLM-powered habit extraction from conversations
    - `chat-tools/` - AI tool definitions
      - `habit-tools.ts` - createCalendarEvent and getUpcomingEvents tools
  - `firebase/` - Firebase configuration and auth
  - `contexts/` - React contexts
- `components/` - React components
  - `auth/` - Authentication components

### Service Layer Pattern
The app uses a clean service layer architecture:
- API routes are thin controllers
- All business logic lives in `lib/services/`
- AI tools defined separately for modularity
- Easy to test and scale

### Calendar Integration Flow
1. User discusses habits with AI coach in chat
2. ChatService uses AI tools to extract habit details
3. AI confirms details with user before creating events
4. GoogleCalendarService creates recurring events via googleapis
5. User receives confirmation with event link

## Environment Setup

### Required Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for chat functionality (required)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase configuration (optional for auth)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Replit Integrations
- **Google Calendar**: Connected via Replit Connector (OAuth managed by Replit)
  - Tokens auto-refresh via connector API
  - No manual OAuth setup required

## Replit Configuration

### Workflow
- **Next.js Dev Server**: Runs on port 5000 with host 0.0.0.0
- Command: `npm run dev -- -p 5000 -H 0.0.0.0`
- The app is configured to allow all hosts for Replit's proxy
- Chat API uses nodejs runtime (required for googleapis)

### Deployment
- When ready to deploy, the app should use `npm run build` and `npm start`
- Production server should run on port 5000

## Current Features (MVP)
- Landing page with glassmorphic design
- AI chat modal with streaming responses
- Google Calendar integration for habit scheduling
- AI-powered habit extraction from conversations
- Automatic recurring calendar event creation
- Service architecture for scalability
- Type-safe TypeScript implementation
- Firebase Auth setup (requires configuration)

## AI Tools Available
- **createCalendarEvent**: Creates recurring calendar events for habits
  - Supports daily, weekly, biweekly, monthly recurrence
  - Configurable start time, duration, days of week
  - Timezone-aware scheduling
- **getUpcomingEvents**: Fetches user's calendar to find scheduling gaps

## Planned Features
- Social features (friend matching, groups)
- SMS check-ins via Twilio
- Goal tracking and CRUD operations
- User timezone preferences persistence

## Development Notes
- Mobile-first responsive design
- Server Components by default
- Clean separation of concerns
- No mock data - uses real APIs
- Chat API uses nodejs runtime (required for googleapis)
- Timezone handling uses Intl API for accurate date calculations

## User Preferences
- None documented yet
