import { z } from "zod";
import { googleCalendarService } from "../calendar/google-calendar-service";
import type { RecurrencePattern, DayOfWeek } from "../habits/habit-types";

const DAY_MAP: Record<DayOfWeek, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

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

  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  });
  const weekdayStr = weekdayFormatter.format(date);
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    dayOfWeek: weekdayMap[weekdayStr] ?? 0,
  };
}

function addDaysToComponents(components: any, daysToAdd: number, timezone: string) {
  const targetTimestamp = Date.UTC(
    components.year,
    components.month - 1,
    components.day + daysToAdd,
    12,
    0,
    0
  );

  const result = getDateComponentsInTimezone(targetTimestamp, timezone);
  return {
    ...result,
    hour: components.hour,
    minute: components.minute,
  };
}

function findNextOccurrence(targetDays: DayOfWeek[] | undefined, hours: number, minutes: number, timezone: string) {
  const nowTimestamp = Date.now();
  const now = getDateComponentsInTimezone(nowTimestamp, timezone);

  const currentTimeMinutes = now.hour * 60 + now.minute;
  const targetTimeMinutes = hours * 60 + minutes;
  const todayPassed = currentTimeMinutes >= targetTimeMinutes;

  if (!targetDays || targetDays.length === 0) {
    if (todayPassed) {
      const tomorrow = addDaysToComponents(now, 1, timezone);
      return { ...tomorrow, hour: hours, minute: minutes };
    }
    return { ...now, hour: hours, minute: minutes };
  }

  const targetDayNumbers = targetDays.map((d) => DAY_MAP[d]).sort((a, b) => a - b);
  const today = now.dayOfWeek;

  for (const targetDay of targetDayNumbers) {
    let daysUntil = targetDay - today;
    if (daysUntil < 0) daysUntil += 7;

    if (daysUntil === 0) {
      if (!todayPassed) {
        return { ...now, hour: hours, minute: minutes };
      }
      continue;
    }

    const future = addDaysToComponents(now, daysUntil, timezone);
    return { ...future, hour: hours, minute: minutes };
  }

  const firstTargetDay = targetDayNumbers[0];
  let daysUntil = firstTargetDay - today;
  if (daysUntil <= 0) daysUntil += 7;

  const future = addDaysToComponents(now, daysUntil, timezone);
  return { ...future, hour: hours, minute: minutes };
}

function addMinutesToComponents(components: any, minutesToAdd: number, timezone: string) {
  let totalMinutes = components.hour * 60 + components.minute + minutesToAdd;
  let daysToAdd = 0;

  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    daysToAdd += 1;
  }

  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;

  if (daysToAdd > 0) {
    const futureDate = addDaysToComponents(components, daysToAdd, timezone);
    return { ...futureDate, hour: newHour, minute: newMinute };
  }

  return { ...components, hour: newHour, minute: newMinute };
}

function formatDateTimeComponents(c: any): string {
  const y = c.year.toString();
  const m = c.month.toString().padStart(2, "0");
  const d = c.day.toString().padStart(2, "0");
  const h = c.hour.toString().padStart(2, "0");
  const min = c.minute.toString().padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00`;
}

function formatDisplayDate(c: any): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[c.dayOfWeek]}, ${months[c.month - 1]} ${c.day}`;
}

const createCalendarEventSchema = z.object({
  summary: z.string().describe("Event title (e.g., 'Morning Meditation')"),
  description: z.string().optional().describe("Optional event description"),
  startTime: z.string().describe("Start time in HH:MM format (e.g., '07:00')"),
  durationMinutes: z.number().default(30).describe("Duration in minutes"),
  frequencyType: z.enum(["daily", "weekly", "biweekly", "monthly"]).describe("Frequency"),
  daysOfWeek: z
    .array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]))
    .optional()
    .describe("Days for weekly habits"),
  timezone: z.string().default("America/Los_Angeles").describe("User timezone"),
});

const getUpcomingEventsSchema = z.object({
  maxResults: z.number().default(5).describe("Number of events to fetch"),
});

export const habitTools = {
  createCalendarEvent: {
    description: `Create a recurring calendar event for a habit. Use when the user confirms they want to schedule a habit on their calendar.`,
    parameters: createCalendarEventSchema,
    execute: async (params: z.infer<typeof createCalendarEventSchema>) => {
      try {
        const [hours, minutes] = params.startTime.split(":").map(Number);

        const startComponents = findNextOccurrence(params.daysOfWeek as DayOfWeek[], hours, minutes, params.timezone);
        const endComponents = addMinutesToComponents(startComponents, params.durationMinutes, params.timezone);

        const recurrencePattern: RecurrencePattern = {
          type: params.frequencyType,
          daysOfWeek: params.daysOfWeek as DayOfWeek[] | undefined,
        };

        const recurrenceRule = googleCalendarService.buildRecurrenceRule(recurrencePattern);
        const startDateTime = formatDateTimeComponents(startComponents);
        const endDateTime = formatDateTimeComponents(endComponents);

        const event = await googleCalendarService.createEvent({
          summary: params.summary,
          description: params.description || `Habit tracking for: ${params.summary}`,
          startDateTime,
          endDateTime,
          timezone: params.timezone,
          recurrence: recurrenceRule,
        });

        const displayDate = formatDisplayDate(startComponents);
        const frequencyText =
          params.frequencyType === "daily"
            ? "every day"
            : params.frequencyType === "weekly"
              ? `every week`
              : params.frequencyType === "biweekly"
                ? "every two weeks"
                : "every month";

        return `✅ Created "${params.summary}" on your calendar! First session: ${displayDate} at ${params.startTime}. Repeats ${frequencyText}. View it: ${event.htmlLink}`;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return `❌ Could not create event: ${msg}`;
      }
    },
  },
  getUpcomingEvents: {
    description: `Fetch upcoming calendar events to help find good times for new habits.`,
    parameters: getUpcomingEventsSchema,
    execute: async (params: z.infer<typeof getUpcomingEventsSchema>) => {
      try {
        const events = await googleCalendarService.listEvents(params.maxResults);
        if (events.length === 0) {
          return "No upcoming events found.";
        }
        const eventList = events.map((e) => `• ${e.summary} at ${e.start.dateTime}`).join("\n");
        return `Found ${events.length} upcoming events:\n${eventList}`;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return `❌ Could not fetch calendar: ${msg}`;
      }
    },
  },
};
