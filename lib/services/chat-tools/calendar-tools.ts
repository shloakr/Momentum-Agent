import { z } from "zod";
import { googleCalendarService } from "../calendar/google-calendar-service";

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

// Tool definitions
const createEventSchema = z.object({
  summary: z.string().describe("Event title/name (e.g., 'do cs188 hw', 'workout')"),
  date: z.string().describe("Event date (e.g., '2025-11-26' or 'Wednesday, November 26')"),
  startTime: z.string().describe("Start time in HH:MM format (e.g., '11:30')"),
  durationMinutes: z.number().default(60).describe("Duration in minutes"),
  timezone: z.string().default("America/Los_Angeles").describe("Timezone"),
});

const getEventsSchema = z.object({
  maxResults: z.number().default(5).describe("Number of events to fetch"),
});

export const calendarTools = {
  createEvent: {
    description: "Create a single event on the user's Google Calendar from natural language",
    parameters: createEventSchema,
    execute: async (params: z.infer<typeof createEventSchema>) => {
      try {
        let eventDate = new Date();
        
        if (params.date.includes(",") || params.date.match(/\w+day/)) {
          const parsed = new Date(params.date);
          if (!isNaN(parsed.getTime())) {
            eventDate = parsed;
          } else {
            const isoDate = new Date(params.date);
            if (!isNaN(isoDate.getTime())) {
              eventDate = isoDate;
            }
          }
        } else {
          const isoDate = new Date(params.date);
          if (!isNaN(isoDate.getTime())) {
            eventDate = isoDate;
          }
        }

        const [hours, minutes] = params.startTime.split(":").map(Number);
        const startComponents = getDateComponentsInTimezone(eventDate.getTime(), params.timezone);
        startComponents.hour = hours;
        startComponents.minute = minutes;

        const endComponents = addMinutesToComponents(startComponents, params.durationMinutes);

        const startDateTime = formatDateTimeComponents(startComponents);
        const endDateTime = formatDateTimeComponents(endComponents);

        const event = await googleCalendarService.createEvent({
          summary: params.summary,
          description: params.summary,
          startDateTime,
          endDateTime,
          timezone: params.timezone,
          recurrence: [],
        });

        const formattedDate = eventDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        return `✅ Event created! "${params.summary}" on ${formattedDate} at ${params.startTime}. View: ${event.htmlLink}`;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return `❌ Failed: ${msg}`;
      }
    },
  },
  getUpcomingEvents: {
    description: "Fetch upcoming Google Calendar events",
    parameters: getEventsSchema,
    execute: async (params: z.infer<typeof getEventsSchema>) => {
      try {
        const events = await googleCalendarService.listEvents(params.maxResults);
        if (events.length === 0) {
          return "No upcoming events.";
        }
        const eventList = events
          .map((e) => {
            const date = new Date(e.start.dateTime);
            const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            return `• ${e.summary} - ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${timeStr}`;
          })
          .join("\n");
        return `Upcoming events:\n${eventList}`;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return `❌ Error: ${msg}`;
      }
    },
  },
};
