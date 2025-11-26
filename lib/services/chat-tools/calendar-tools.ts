import { tool } from "ai";
import { z } from "zod";
import { googleCalendarService } from "../calendar/google-calendar-service";
import type { RecurrencePattern, DayOfWeek } from "../habits/habit-types";

// Helper functions for datetime handling
function getDateComponentsInTimezone(timestamp: number, timezone: string) {
  const date = new Date(timestamp);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => {
    const part = parts.find((p) => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
  };
}

function formatDateTimeComponents(c: any): string {
  const y = c.year.toString();
  const m = c.month.toString().padStart(2, "0");
  const d = c.day.toString().padStart(2, "0");
  const h = c.hour.toString().padStart(2, "0");
  const min = c.minute.toString().padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00`;
}

function addMinutesToComponents(components: any, minutesToAdd: number) {
  let totalMinutes = components.hour * 60 + components.minute + minutesToAdd;
  let daysToAdd = 0;

  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    daysToAdd += 1;
  }

  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;

  return {
    ...components,
    hour: newHour,
    minute: newMinute,
    day: components.day + daysToAdd,
  };
}

// Vercel AI SDK formatted tools
export const createEventTool = tool({
  description: `Create a single or recurring event on the user's Google Calendar from natural language. Use this when users ask to create calendar events with date/time specifics.`,
  parameters: z.object({
    summary: z.string().describe("Event title/name (e.g., 'do cs188 hw', 'workout', 'team meeting')"),
    description: z.string().optional().describe("Optional event description or details"),
    date: z.string().describe("Event date in ISO format (YYYY-MM-DD) or natural language (e.g., 'Wednesday, November 26')"),
    startTime: z.string().describe("Start time in HH:MM format using 24-hour time (e.g., '11:30', '14:00')"),
    durationMinutes: z.number().default(60).describe("Event duration in minutes (default: 60)"),
    timezone: z.string().default("America/Los_Angeles").describe("User timezone"),
  }),
  execute: async (params: z.infer<typeof z.object({
    summary: z.string(),
    description: z.string().optional(),
    date: z.string(),
    startTime: z.string(),
    durationMinutes: z.number().default(60),
    timezone: z.string().default("America/Los_Angeles"),
  })>) => {
    try {
      // Parse the date
      let eventDate = new Date();
      
      // Try to parse natural language date like "Wednesday, November 26"
      if (params.date.includes(",") || params.date.match(/\w+day/)) {
        const dateStr = params.date;
        // Try parsing as natural language
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed;
        } else {
          // Fallback: try ISO format
          const isoDate = new Date(params.date);
          if (!isNaN(isoDate.getTime())) {
            eventDate = isoDate;
          }
        }
      } else {
        // ISO format
        const isoDate = new Date(params.date);
        if (!isNaN(isoDate.getTime())) {
          eventDate = isoDate;
        }
      }

      // Parse start time
      const [hours, minutes] = params.startTime.split(":").map(Number);

      // Get timezone-aware components
      const startComponents = getDateComponentsInTimezone(eventDate.getTime(), params.timezone);
      startComponents.hour = hours;
      startComponents.minute = minutes;

      const endComponents = addMinutesToComponents(startComponents, params.durationMinutes);

      const startDateTime = formatDateTimeComponents(startComponents);
      const endDateTime = formatDateTimeComponents(endComponents);

      const event = await googleCalendarService.createEvent({
        summary: params.summary,
        description: params.description || params.summary,
        startDateTime,
        endDateTime,
        timezone: params.timezone,
        recurrence: [], // Single event - no recurrence
      });

      const formattedDate = eventDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      return `✅ Event created! "${params.summary}" on ${formattedDate} at ${params.startTime} for ${params.durationMinutes} minutes. View it here: ${event.htmlLink}`;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating event:", error);
      return `❌ Failed to create event: ${msg}`;
    }
  },
});

export const getUpcomingEventsTool = tool({
  description: `Fetch the user's upcoming Google Calendar events. Use this to help users see their schedule or find available time slots.`,
  parameters: z.object({
    maxResults: z.number().default(5).describe("Number of upcoming events to fetch"),
  }),
  execute: async (params: z.infer<typeof z.object({
    maxResults: z.number().default(5),
  })>) => {
    try {
      const events = await googleCalendarService.listEvents(params.maxResults);
      if (events.length === 0) {
        return "You have no upcoming events on your calendar.";
      }
      const eventList = events
        .map((e) => {
          const date = new Date(e.start.dateTime);
          const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          return `• ${e.summary} - ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeStr}`;
        })
        .join("\n");
      return `Here are your upcoming events:\n${eventList}`;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching events:", error);
      return `❌ Could not fetch your calendar: ${msg}`;
    }
  },
});
