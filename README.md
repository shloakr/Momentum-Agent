# Text Momentum MVP

A mobile-first text-based habit builder app that helps users build sustainable habits through AI coaching, social accountability, and calendar integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- NEXT_PUBLIC_FIREBASE_API_KEY=
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
- NEXT_PUBLIC_FIREBASE_APP_ID=

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Create .env.local file
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 📱 Features

### Current (MVP)
- ✅ **Landing Page**: Mobile-first glassmorphic design with action buttons
- ✅ **AI Chat Modal**: Streaming chat interface with OpenAI integration
- ✅ **Service Architecture**: Scalable service layer for future features
- ✅ **Type-Safe**: Full TypeScript with shared type definitions
- ✅ **Authentication**: Firebase Auth + Google OAuth

### Coming Soon (Per Spec)
- 🔜 **Calendar Integration**: Google Calendar API for scheduling
- 🔜 **Social Features**: Friend matching, group discovery
- 🔜 **SMS Check-ins**: Twilio integration for accountability
- 🔜 **Goal Tracking**: CRUD operations on habits and goals

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # Chat API endpoint (uses ChatService)
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Landing page with chat modal
│   └── globals.css                   # Global styles + custom scrollbar
│
├── lib/
│   ├── services/
│   │   ├── chat-service.ts           # AI chat logic & tool integration
│   │   ├── types.ts                  # Shared TypeScript types
│   │   └── README.md                 # Service architecture docs
│   └── utils.ts                      # Utility functions (cn helper)
│
├── .env.local                        # Environment variables (not in git)
├── .env.example                      # Template for env vars
├── spec.txt                          # Full product specification
└── package.json                      # Dependencies
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **AI** | Vercel AI SDK + OpenAI (gpt-4o-mini) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Database** | Firebase (planned) |
| **Auth** | Firebase Auth (planned) |
| **SMS** | Twilio (planned) |
| **Calendar** | Google Calendar API (planned) |

## 📐 Architecture

### Service Layer Pattern

The app uses a service layer to separate business logic from API routes:

```typescript
// API Route (thin)
app/api/chat/route.ts → calls → ChatService

// Service (business logic)
lib/services/chat-service.ts → handles AI, tools, integrations
```

**Benefits:**
- Clean separation of concerns
- Easy to test
- Scalable for multiple tools/integrations
- Reusable across different endpoints

### Key Services (Current & Planned)

1. **ChatService** (`lib/services/chat-service.ts`)
   - Handles AI conversations
   - Manages system prompts
   - Will integrate tools (calendar, SMS, etc.)

2. **CalendarService** (planned)
   - Google Calendar OAuth
   - Event CRUD operations
   - Availability matching

3. **NotificationService** (planned)
   - Twilio SMS integration
   - Scheduled check-ins
   - Multi-channel notifications

4. **UserService** (planned)
   - Profile management
   - Goal tracking
   - Social connections

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`from-blue-500 to-blue-600`)
- **Secondary**: Purple/Pink accents
- **Background**: Glassmorphic with blur effects
- **Text**: Gray scale for hierarchy

### Components
- **Modal Chat**: Full-screen on mobile, centered on desktop
- **Buttons**: Rounded-3xl with hover/tap animations
- **Input**: White background with blue focus ring
- **Messages**: Bubble design with gradient for user messages

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for chat | ✅ Yes |
| `FIREBASE_API_KEY` | Firebase config | 🔜 Soon |
| `GOOGLE_CLIENT_ID` | Google OAuth | 🔜 Soon |
| `TWILIO_ACCOUNT_SID` | Twilio SMS | 🔜 Soon |

## 🧪 Development Workflow

### Adding New Features

1. **Define types** in `lib/services/types.ts`
2. **Create service** in `lib/services/[feature]-service.ts`
3. **Add API route** in `app/api/[feature]/route.ts`
4. **Build UI** in `app/[feature]/page.tsx`
5. **Update this README**

### Example: Adding Calendar Integration

```typescript
// 1. Define types
interface CalendarEvent { ... }

// 2. Create service
class CalendarService {
  async getEvents() { ... }
  async createEvent() { ... }
}

// 3. Add to ChatService tools
tools: {
  getCalendar: {
    execute: async () => calendarService.getEvents()
  }
}
```

## 📝 Code Style

Following Next.js 15 + React Server Components best practices:

- **Functional components** with TypeScript interfaces
- **Server Components** by default, `"use client"` only when needed
- **Async/await** for all async operations
- **Error boundaries** for production resilience
- **Mobile-first** responsive design

## 🐛 Common Issues

### Chat not responding?
1. Check `.env.local` has valid `OPENAI_API_KEY`
2. Restart dev server after adding env vars
3. Check browser console for errors
4. Verify API route returns 200 status

### Styling issues?
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

## 🚢 Deployment

Ready to deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## 📚 Additional Documentation

- [Service Architecture](lib/services/README.md) - Detailed service layer docs
- [Product Spec](spec.txt) - Full MVP requirements
- [Cursor Rules](.cursor/rules/cs188-rules.mdc) - AI coding guidelines

## 🤝 Contributing

This is a CS188 project. When contributing:

1. Follow the existing architecture patterns
2. Add types for all new data structures
3. Use the service layer for business logic
4. Keep API routes thin
5. Update this README with new features

## 📄 License

Private project for CS188

---

# 🤖 FOR AI AGENTS & LLMs

> **This section is specifically for AI coding assistants (Cursor, Claude, GitHub Copilot, etc.) working on this codebase.**

## Context & Purpose

**Text Momentum** is a habit-building app with AI coaching, social accountability, and calendar integration. The MVP focuses on an AI chat interface that will eventually integrate with Google Calendar and Twilio SMS for scheduled check-ins.

## Architecture Overview

### Core Pattern: Service Layer Architecture

```
User Request → API Route → Service Layer → External APIs/Database
                ↓
            Response Stream
```

**Key Principle**: API routes are thin controllers. All business logic lives in services.

### File Organization

```
app/                    # Next.js App Router
├── api/               # API endpoints (thin, delegate to services)
├── [feature]/         # Feature pages (use client components sparingly)
└── layout.tsx         # Root layout

lib/
├── services/          # Business logic layer
│   ├── chat-service.ts      # AI chat & tool orchestration
│   ├── types.ts             # Shared TypeScript interfaces
│   └── [feature]-service.ts # Future services
└── utils.ts           # Pure utility functions
```

## Code Patterns to Follow

### 1. API Routes (Keep Thin)

```typescript
// ✅ GOOD: Delegate to service
export async function POST(req: Request) {
  const { messages } = await req.json();
  return await chatService.streamResponse(messages);
}

// ❌ BAD: Business logic in route
export async function POST(req: Request) {
  const result = await streamText({ ... }); // Too much logic here
}
```

### 2. Services (Business Logic)

```typescript
// ✅ GOOD: Encapsulated, testable, reusable
export class ChatService {
  async streamResponse(messages: CoreMessage[]) {
    // All AI logic here
  }
  
  async analyzeGoal(goal: string) {
    // Tool integration here
  }
}
```

### 3. Type Definitions

```typescript
// ✅ GOOD: Shared types in lib/services/types.ts
export interface UserProfile {
  id: string;
  goals: Goal[];
  // ...
}

// ❌ BAD: Types scattered across files
```

### 4. Client Components

```typescript
// ✅ GOOD: Only use "use client" when necessary
"use client";
import { useState } from "react";

// For: user interactions, hooks, browser APIs

// ❌ BAD: Using "use client" unnecessarily
// Server components are faster and better for SEO
```

## When Adding New Features

### Checklist for AI Agents

- [ ] **Types First**: Add interfaces to `lib/services/types.ts`
- [ ] **Service Layer**: Create/update service in `lib/services/`
- [ ] **API Route**: Create thin route that uses service
- [ ] **UI Component**: Build with mobile-first approach
- [ ] **Error Handling**: Add try-catch and user-friendly errors
- [ ] **TypeScript**: Ensure no `any` types, use strict mode
- [ ] **Documentation**: Update this README and service README

### Example: Adding Calendar Feature

```typescript
// 1. Types (lib/services/types.ts)
export interface CalendarEvent {
  id: string;
  startTime: Date;
  endTime: Date;
}

// 2. Service (lib/services/calendar-service.ts)
export class CalendarService {
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    // Google Calendar API integration
  }
}

// 3. API Route (app/api/calendar/route.ts)
export async function GET(req: Request) {
  const userId = req.headers.get("user-id");
  return Response.json(await calendarService.getEvents(userId));
}

// 4. Integrate with ChatService tools
tools: {
  getCalendar: {
    description: "Get user's calendar events",
    execute: async () => calendarService.getEvents(userId)
  }
}
```

## Important Constraints

### What to ALWAYS Do

1. **Use TypeScript strictly** - No `any`, define all interfaces
2. **Mobile-first design** - Test on mobile viewport (430x932)
3. **Error boundaries** - Wrap async operations in try-catch
4. **Service layer** - Never put business logic in API routes
5. **Streaming responses** - Use `toTextStreamResponse()` for AI
6. **Environment variables** - Never hardcode API keys

### What to NEVER Do

1. ❌ Don't use `useChat` from `@ai-sdk/react` (it's broken, we use custom implementation)
2. ❌ Don't put business logic in API routes
3. ❌ Don't use `any` type in TypeScript
4. ❌ Don't commit `.env.local` or API keys
5. ❌ Don't use `"use client"` unless absolutely necessary
6. ❌ Don't create new patterns - follow existing architecture

## AI Tool Integration

When adding tools to ChatService:

```typescript
import { z } from "zod";

tools: {
  toolName: {
    description: "Clear description for the AI",
    parameters: z.object({
      param: z.string().describe("What this param does"),
    }),
    execute: async ({ param }) => {
      // Call service method
      return await someService.doSomething(param);
    },
  },
}
```

## Debugging Tips for AI Agents

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Chat not working | Check `OPENAI_API_KEY` in `.env.local` |
| Type errors | Import from `lib/services/types.ts` |
| Streaming broken | Use `toTextStreamResponse()` not `toDataStreamResponse()` |
| Client component error | Add `"use client"` at top of file |
| Import errors | Use `@/` alias for imports from root |

### Testing Checklist

- [ ] TypeScript compiles without errors
- [ ] Chat modal opens and closes smoothly
- [ ] Messages send and stream responses
- [ ] Mobile viewport (430x932) looks good
- [ ] No console errors
- [ ] API returns 200 status

## Current State & Next Steps

### ✅ Completed
- Landing page with modal chat
- AI chat with streaming responses
- Service architecture foundation
- Type definitions for future features
- Mobile-first responsive design

### 🔜 Immediate Next Steps (Priority Order)
1. **Firebase Auth** - User authentication and profiles
2. **Google Calendar OAuth** - Calendar connection flow
3. **Calendar Service** - Read/write calendar events
4. **Onboarding Agent** - Goal definition conversation flow
5. **Twilio SMS** - Scheduled check-in notifications

### 📋 Implementation Notes

**Firebase Setup:**
- Use Firebase Auth for user management
- Firestore for user profiles, goals, check-ins
- Security rules to protect user data
- Encrypt calendar data before storing

**Calendar Integration:**
- OAuth 2.0 flow for Google Calendar
- Store refresh tokens securely
- Agent needs `getCalendarEvents` tool
- Agent needs `createCalendarEvent` tool

**SMS Check-ins:**
- Use Twilio API for SMS
- Cron jobs or BullMQ for scheduling
- Agent analyzes check-in responses
- Updates user profile based on feedback

## Prompt Engineering Notes

### System Prompt Strategy

The ChatService uses a detailed system prompt to guide the AI agent. When modifying:

1. **Be specific** about the agent's role
2. **Define clear objectives** (from spec.txt)
3. **Provide examples** of good interactions
4. **Set boundaries** on what the agent can/can't do

Current focus areas:
- Goal definition and validation
- Understanding past failures
- Identifying success patterns
- Social preference (friends vs. random pairing)

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit `any`
- Interfaces over types
- Descriptive names with auxiliary verbs

### React/Next.js
- Functional components only
- Server Components by default
- Async/await for data fetching
- Error boundaries for resilience

### Styling
- Tailwind CSS utility classes
- Mobile-first breakpoints
- Consistent spacing scale
- Glassmorphic design system

## Questions to Ask Before Coding

1. **Does this belong in a service?** (If yes, create/update service)
2. **Do I need "use client"?** (Only for interactivity/hooks)
3. **Are my types defined?** (Add to types.ts first)
4. **Is this mobile-first?** (Test on 430px width)
5. **Will this scale?** (Follow service pattern)

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Run ESLint

# Debugging
rm -rf .next            # Clear Next.js cache
rm -rf node_modules     # Clear dependencies
npm install             # Reinstall dependencies

# Type checking
npx tsc --noEmit        # Check TypeScript errors
```

## Final Notes for AI Agents

- **Read spec.txt** for full product requirements
- **Check lib/services/README.md** for service architecture details
- **Follow existing patterns** - consistency is key
- **Ask clarifying questions** if requirements are ambiguous
- **Test on mobile** - this is a mobile-first app
- **Keep it simple** - don't over-engineer

When in doubt, look at existing code patterns and follow the same structure. The codebase is designed to be intuitive and scalable.

---

**Happy coding! 🚀**

