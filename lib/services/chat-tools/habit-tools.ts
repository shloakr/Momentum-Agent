import { z } from "zod";
import { googleCalendarService } from "../calendar/google-calendar-service";
import type { RecurrencePattern, DayOfWeek } from "../habits/habit-types";

const createCalendarEventSchema = z.object({
  summary: z
    .string()
    .describe("Event title, e.g., 'Morning Meditation' or 'Exercise Session'"),
  description: z
    .string()
    .optional()
    .describe("Optional description or notes for the event"),
  startTime: z
    .string()
    .describe("Start time in HH:MM format, e.g., '07:00' for 7 AM"),
  durationMinutes: z
    .number()
    .default(30)
    .describe("Duration in minutes, defaults to 30"),
  frequencyType: z
    .enum(["daily", "weekly", "biweekly", "monthly"])
    .describe("How often the habit occurs"),
  daysOfWeek: z
    .array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]))
    .optional()
    .describe("For weekly habits, which days of the week"),
  timezone: z
    .string()
    .default("America/Los_Angeles")
    .describe("User's timezone, e.g., 'America/New_York'"),
});

const getUpcomingEventsSchema = z.object({
  maxResults: z
    .number()
    .default(5)
    .describe("Maximum number of events to retrieve"),
});

type CreateCalendarEventParams = z.infer<typeof createCalendarEventSchema>;
type GetUpcomingEventsParams = z.infer<typeof getUpcomingEventsSchema>;

async function executeCreateCalendarEvent({
  summary,
  description,
  startTime,
  durationMinutes,
  frequencyType,
  daysOfWeek,
  timezone,
}: CreateCalendarEventParams) {
  try {
    const now = new Date();
    const [hours, minutes] = startTime.split(":").map(Number);

    const startDate = new Date(now);
    startDate.setHours(hours, minutes, 0, 0);
    if (startDate <= now) {
      startDate.setDate(startDate.getDate() + 1);
    }

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    const recurrencePattern: RecurrencePattern = {
      type: frequencyType,
      daysOfWeek: daysOfWeek as DayOfWeek[] | undefined,
    };

    const recurrenceRule =
      googleCalendarService.buildRecurrenceRule(recurrencePattern);

    const event = await googleCalendarService.createEvent({
      summary,
      description: description || `Habit tracking for: ${summary}`,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      timezone,
      recurrence: recurrenceRule,
    });

    return {
      success: true,
      eventId: event.id,
      eventLink: event.htmlLink,
      message: `Created recurring "${summary}" event! Your first session is scheduled for ${startDate.toLocaleDateString()} at ${startTime}. The event will repeat ${frequencyType}${daysOfWeek && daysOfWeek.length > 0 ? ` on ${daysOfWeek.join(", ")}` : ""}.`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating calendar event:", error);
    return {
      success: false,
      error: errorMessage,
      message: `I couldn't create the calendar event. ${errorMessage || "Please make sure Google Calendar is connected."}`,
    };
  }
}

async function executeGetUpcomingEvents({ maxResults }: GetUpcomingEventsParams) {
  try {
    const events = await googleCalendarService.listEvents(maxResults);

    if (events.length === 0) {
      return {
        success: true,
        events: [],
        message: "No upcoming events found in your calendar.",
      };
    }

    return {
      success: true,
      events: events.map((e) => ({
        id: e.id,
        summary: e.summary,
        start: e.start.dateTime,
        end: e.end.dateTime,
      })),
      message: `Found ${events.length} upcoming events.`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching calendar events:", error);
    return {
      success: false,
      error: errorMessage,
      message: `I couldn't fetch your calendar. ${errorMessage || "Please make sure Google Calendar is connected."}`,
    };
  }
}

export const habitToolDefinitions = {
  createCalendarEvent: {
    description: `Create a recurring calendar event for a habit that the user has confirmed they want to track. 
Use this tool when the user has clearly stated they want to commit to a habit with specific timing.
Always confirm the details with the user before creating the event.`,
    parameters: createCalendarEventSchema,
    execute: executeCreateCalendarEvent,
  },
  getUpcomingEvents: {
    description: `Fetch the user's upcoming calendar events to help understand their schedule and find good times for new habits.`,
    parameters: getUpcomingEventsSchema,
    execute: executeGetUpcomingEvents,
  },
};

export { createCalendarEventSchema, getUpcomingEventsSchema };
