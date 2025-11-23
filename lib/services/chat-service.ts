import { openai } from "@ai-sdk/openai";
import { streamText, CoreMessage } from "ai";

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
- Help users define clear, actionable goals
- Understand why they've struggled with habits before
- Identify what has worked for them in the past
- Guide them through building sustainable habits
- Provide encouragement and accountability

Be warm, supportive, and ask thoughtful questions to understand their needs.`;
  }

  async streamResponse(messages: CoreMessage[]) {
    const result = await streamText({
      model: openai(this.model),
      system: this.systemPrompt,
      messages,
      // Tools will be added here as we build them
      // tools: {
      //   getCalendarEvents: ...,
      //   scheduleEvent: ...,
      //   sendSMS: ...,
      // },
    });

    return result.toTextStreamResponse();
  }

  // Future methods for specific agent capabilities
  async analyzeGoal(goal: string) {
    // Logic to analyze if a goal is compatible with the app
    // Will integrate with goal validation service
  }

  async suggestSchedule(userProfile: any, goal: string) {
    // Logic to suggest optimal times based on calendar and profile
    // Will integrate with calendar service
  }

  async sendCheckIn(userId: string, eventId: string) {
    // Logic to send scheduled check-ins via SMS
    // Will integrate with Twilio service
  }
}

export const chatService = new ChatService();

