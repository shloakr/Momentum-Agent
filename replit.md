# Text Momentum - Replit Project

## Overview
Text Momentum is a mobile-first habit-building app with AI coaching, social accountability, and calendar integration. This is a Next.js 15 application using TypeScript, Tailwind CSS, and OpenAI for AI chat functionality.

## Recent Changes
- **2025-11-25**: Implemented Google Calendar integration foundation
  - Created GoogleCalendarService for calendar API interactions
  - Built HabitParser service for LLM-assisted habit extraction
  - Created AI tool definitions for calendar event creation and retrieval
  - Added timezone-aware date handling utilities
  - Changed chat API to nodejs runtime (required for googleapis)
  - Installed date-fns-tz for advanced timezone handling
  - Calendar tools currently disabled - will be re-enabled with proper AI SDK integration

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
  - `api/chat/route.ts` - Chat API endpoint (nodejs runtime)
  - `page.tsx` - Landing page with chat modal
- `lib/` - Shared libraries and services
  - `services/` - Business logic layer
    - `chat-service.ts` - AI chat with system prompt
    - `calendar/google-calendar-service.ts` - Google Calendar API wrapper
    - `habits/` - Habit extraction services
      - `habit-types.ts` - TypeScript interfaces
      - `habit-parser.ts` - LLM-powered habit extraction
    - `chat-tools/habit-tools.ts` - AI tool definitions
- `components/` - React components
- `contexts/` - React contexts (auth)

## Current Features
- ✅ Landing page with glassmorphic design
- ✅ AI chat modal with streaming responses
- ✅ Google Calendar API integration (service layer)
- ✅ Habit extraction logic
- ✅ Firebase Auth with Google OAuth
- ✅ Mobile-first responsive design

## Next Steps for Calendar Tools
The calendar tools (createCalendarEvent, getUpcomingEvents) are ready but need proper integration with the Vercel AI SDK's streamText function. The foundation is complete:
- GoogleCalendarService: ✅ Fully functional
- HabitParser: ✅ Extracts habits from conversations
- Tool definitions: ✅ Ready to integrate (need AI SDK format fix)

## Environment Setup

### Required Environment Variables
- `OPENAI_API_KEY` - OpenAI API key (required)
- Firebase config vars (optional for auth features)

### Replit Integrations
- **Google Calendar**: Connected and ready
- **OPENAI_API_KEY**: Secret configured

## Replit Configuration

### Workflow
- **Next.js Dev Server**: Port 5000, host 0.0.0.0
- Command: `npm run dev -- -p 5000 -H 0.0.0.0`

### API Runtime
- Chat API uses nodejs runtime (required for googleapis)

## User Preferences
- None documented yet
