import { openai } from "@ai-sdk/openai";
import { streamText, CoreMessage } from "ai";
import { calendarTools } from "./chat-tools/calendar-tools";

export interface ChatServiceConfig {
  model?: string;
  systemPrompt?: string;
}

export class ChatService {
  private model: string;
  private systemPrompt: string;

  constructor(config?: ChatServiceConfig) {
    this.model = config?.model || "gpt-4o-mini";
    this.systemPrompt = config?.systemPrompt || this.getDefaultSystemPrompt();
  }

  private getDefaultSystemPrompt(): string {
    return `You are a helpful assistant for Text Momentum, a habit-building app that helps users achieve their goals through accountability and social support.

Your role is to:
- Help users define clear, actionable habits and goals
- Understand why they've struggled with habits before
- Identify what has worked for them in the past
- Guide them through building sustainable habits
- Provide encouragement and accountability
- Help schedule events on their Google Calendar

When users ask to create calendar events:
- Listen carefully for the event name/title, date, and time
- If they provide natural language dates (e.g., "Wednesday, November 26"), convert them to ISO format (YYYY-MM-DD)
- Convert times to 24-hour format (e.g., "11:30 AM" becomes "11:30")
- Once you have the date, time, and event name, use the createEventTool to create the event
- After creating the event, confirm it was created and provide a link

When discussing habits with users:
1. First understand what habit they want to build
2. Ask about their preferred schedule (time of day, days of the week, frequency)
3. Help them create the habit on their calendar using the available tools

Be warm, supportive, and ask thoughtful questions to understand their needs.
If a user asks to see their calendar, use the getUpcomingEvents tool to fetch and show their events.`;
  }

  async streamResponse(messages: CoreMessage[], calendarContext: string = "") {
    const systemPrompt = this.systemPrompt + calendarContext;

    const result = await streamText({
      model: openai(this.model),
      system: systemPrompt,
      messages,
      tools: calendarTools as any,
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
