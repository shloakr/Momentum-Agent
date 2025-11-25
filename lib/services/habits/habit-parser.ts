import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { HabitIntent, RecurrencePattern, DayOfWeek } from "./habit-types";

const HabitIntentSchema = z.object({
  activity: z.string().describe("The habit activity name, e.g., 'exercise', 'meditate', 'read'"),
  frequencyType: z.enum(["daily", "weekly", "biweekly", "monthly"]).describe("How often the habit occurs"),
  daysOfWeek: z.array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"])).optional().describe("Specific days for weekly habits"),
  preferredStartTime: z.string().optional().describe("Preferred start time in HH:MM format, e.g., '07:00'"),
  preferredEndTime: z.string().optional().describe("Preferred end time in HH:MM format, e.g., '08:00'"),
  durationMinutes: z.number().optional().describe("Duration in minutes if specified"),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0 to 1 that this is a valid habit intent"),
  rawText: z.string().describe("The exact text that describes this habit from the conversation"),
});

const HabitExtractionSchema = z.object({
  habits: z.array(HabitIntentSchema).describe("List of habits extracted from the conversation"),
  needsClarification: z.boolean().describe("Whether the user needs to provide more details"),
  clarificationQuestion: z.string().optional().describe("Question to ask for clarification if needed"),
});

export class HabitParser {
  async parseConversation(
    conversationText: string,
    userTimezone: string = "America/Los_Angeles"
  ): Promise<{
    habits: HabitIntent[];
    needsClarification: boolean;
    clarificationQuestion?: string;
  }> {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: HabitExtractionSchema,
      prompt: `Analyze this conversation and extract any habit commitments the user has made.

Conversation:
${conversationText}

User timezone: ${userTimezone}

Extract habits where the user has expressed intent to do something regularly. Look for:
- Specific activities (exercise, meditation, reading, studying, etc.)
- Frequency patterns (daily, weekly, specific days like "every Monday")
- Time preferences (morning, 7am, after work, etc.)
- Duration if mentioned

Set confidence high (0.8-1.0) when:
- User explicitly states they want to do something regularly
- Time and frequency are clearly specified

Set confidence medium (0.5-0.7) when:
- User mentions a habit but details are vague
- Need confirmation on specifics

Set confidence low (0.2-0.4) when:
- Just discussing habits generally without commitment
- Very unclear on what they want to do

If important details are missing (like specific time or days), set needsClarification to true and provide a clarificationQuestion.`,
    });

    return {
      habits: object.habits.map((h) => ({
        activity: h.activity,
        frequency: this.buildRecurrencePattern(h.frequencyType, h.daysOfWeek as DayOfWeek[]),
        preferredTime: h.preferredStartTime
          ? {
              startTime: h.preferredStartTime,
              endTime: h.preferredEndTime,
            }
          : undefined,
        duration: h.durationMinutes,
        confidence: h.confidence,
        rawText: h.rawText,
      })),
      needsClarification: object.needsClarification,
      clarificationQuestion: object.clarificationQuestion,
    };
  }

  private buildRecurrencePattern(
    type: "daily" | "weekly" | "biweekly" | "monthly",
    daysOfWeek?: DayOfWeek[]
  ): RecurrencePattern {
    return {
      type,
      daysOfWeek: daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : undefined,
    };
  }
}

export const habitParser = new HabitParser();
