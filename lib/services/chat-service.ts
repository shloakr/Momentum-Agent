import { openai } from "@ai-sdk/openai";
import { streamText, CoreMessage } from "ai";
import { habitTools } from "./chat-tools/habit-tools";

export interface ChatServiceConfig {
  model?: string;
  systemPrompt?: string;
  enableCalendarTools?: boolean;
}

export class ChatService {
  private model: string;
  private systemPrompt: string;
  private enableCalendarTools: boolean;

  constructor(config?: ChatServiceConfig) {
    this.model = config?.model || "gpt-4o-mini";
    this.systemPrompt = config?.systemPrompt || this.getDefaultSystemPrompt();
    this.enableCalendarTools = config?.enableCalendarTools ?? false;
  }

  private getDefaultSystemPrompt(): string {
    return `You are a helpful assistant for Text Momentum, a habit-building app that helps users achieve their goals through accountability and social support.

Your role is to:
- Help users define clear, actionable habits and goals
- Understand why they've struggled with habits before
- Identify what has worked for them in the past
- Guide them through building sustainable habits
- Provide encouragement and accountability
- Help schedule habits on their calendar

When discussing habits with users:
1. First understand what habit they want to build
2. Ask about their preferred schedule (time of day, days of the week, frequency)
3. Clarify the duration of each session
4. Once you have clear details, confirm with the user before creating a calendar event
5. Use the createCalendarEvent tool to add the habit to their Google Calendar

For habit scheduling, always gather:
- Activity name (e.g., "morning meditation", "workout", "reading")
- Start time in HH:MM format (e.g., "07:00" for 7 AM)
- Duration in minutes (default to 30 if not specified)
- Frequency: daily, weekly, biweekly, or monthly
- For weekly habits: which specific days (e.g., Monday, Wednesday, Friday)

Before creating a calendar event, always confirm the details with the user:
"I'll create a [frequency] event for [activity] at [time] for [duration] minutes. Does that sound right?"

Be warm, supportive, and ask thoughtful questions to understand their needs.`;
  }

  async streamResponse(messages: CoreMessage[]) {
    const tools = this.enableCalendarTools ? habitTools : undefined;

    const result = await streamText({
      model: openai(this.model),
      system: this.systemPrompt,
      messages,
      tools,
      maxSteps: 5,
    });

    return result.toTextStreamResponse();
  }

  async analyzeGoal(goal: string) {
  }

  async suggestSchedule(userProfile: unknown, goal: string) {
  }

  async sendCheckIn(userId: string, eventId: string) {
  }
}

export const chatService = new ChatService();
