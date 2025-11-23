# Services Architecture

This directory contains the service layer for Text Momentum. Services encapsulate business logic and external integrations.

## Current Services

### ChatService (`chat-service.ts`)
Handles all AI chat interactions and agent logic.

**Features:**
- Streaming chat responses
- Configurable system prompts
- Tool integration (coming soon)

**Future capabilities:**
- Goal analysis and validation
- Schedule suggestions based on calendar
- Automated check-ins via SMS

## Planned Services

### CalendarService
- Google Calendar OAuth integration
- Read/write calendar events
- Find optimal meeting times
- Sync with user schedules

### NotificationService
- Twilio SMS integration
- Scheduled check-ins
- Reminder management
- Multi-channel notifications (SMS, email, push)

### UserService
- User profile management
- Goal tracking
- Habit analytics
- Social connections

### MatchingService
- Pair users with similar goals
- Find common availability
- Build accountability groups
- Friend recommendations

## Usage Example

```typescript
import { chatService } from "@/lib/services/chat-service";

// In API route
const response = await chatService.streamResponse(messages);

// With tools (future)
const result = await chatService.analyzeGoal(userGoal);
```

## Adding New Tools

When adding AI tools to the chat service:

1. Define the tool in `chat-service.ts`
2. Add types to `types.ts`
3. Implement the tool logic
4. Test with the agent

Example:
```typescript
tools: {
  getCalendarEvents: {
    description: "Get user's calendar events",
    parameters: z.object({
      startDate: z.string(),
      endDate: z.string(),
    }),
    execute: async ({ startDate, endDate }) => {
      return await calendarService.getEvents(startDate, endDate);
    },
  },
}
```

