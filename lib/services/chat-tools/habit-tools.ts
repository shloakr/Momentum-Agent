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

interface DateComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number;
}

function getDateComponentsInTimezone(timestamp: number, timezone: string): DateComponents {
  const date = new Date(timestamp);
  
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
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

function addDaysToComponents(
  components: DateComponents,
  daysToAdd: number,
  timezone: string
): DateComponents {
  const targetTimestamp = Date.UTC(
    components.year,
    components.month - 1,
    components.day + daysToAdd,
    12, 0, 0
  );
  
  const result = getDateComponentsInTimezone(targetTimestamp, timezone);
  return {
    ...result,
    hour: components.hour,
    minute: components.minute,
  };
}

function findNextOccurrence(
  targetDays: DayOfWeek[] | undefined,
  hours: number,
  minutes: number,
  timezone: string
): DateComponents {
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

function addMinutesToComponents(
  components: DateComponents,
  minutesToAdd: number,
  timezone: string
): DateComponents {
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

function formatDateTimeComponents(c: DateComponents): string {
  const y = c.year.toString();
  const m = c.month.toString().padStart(2, "0");
  const d = c.day.toString().padStart(2, "0");
  const h = c.hour.toString().padStart(2, "0");
  const min = c.minute.toString().padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}:00`;
}

function formatDisplayDate(c: DateComponents): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${days[c.dayOfWeek]}, ${months[c.month - 1]} ${c.day}`;
}

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
    const [hours, minutes] = startTime.split(":").map(Number);

    const startComponents = findNextOccurrence(
      daysOfWeek as DayOfWeek[],
      hours,
      minutes,
      timezone
    );

    const endComponents = addMinutesToComponents(
      startComponents,
      durationMinutes,
      timezone
    );

    const recurrencePattern: RecurrencePattern = {
      type: frequencyType,
      daysOfWeek: daysOfWeek as DayOfWeek[] | undefined,
    };

    const recurrenceRule =
      googleCalendarService.buildRecurrenceRule(recurrencePattern);

    const startDateTime = formatDateTimeComponents(startComponents);
    const endDateTime = formatDateTimeComponents(endComponents);

    const event = await googleCalendarService.createEvent({
      summary,
      description: description || `Habit tracking for: ${summary}`,
      startDateTime,
      endDateTime,
      timezone,
      recurrence: recurrenceRule,
    });

    const displayDate = formatDisplayDate(startComponents);
    const frequencyText =
      frequencyType === "daily"
        ? "every day"
        : frequencyType === "weekly"
          ? `every week${daysOfWeek && daysOfWeek.length > 0 ? ` on ${daysOfWeek.join(", ")}` : ""}`
          : frequencyType === "biweekly"
            ? "every two weeks"
            : "every month";

    return {
      success: true,
      eventId: event.id,
      eventLink: event.htmlLink,
      message: `Created "${summary}" on your calendar! Your first session is ${displayDate} at ${startTime}. It will repeat ${frequencyText}. You can view it here: ${event.htmlLink}`,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating calendar event:", error);
    return {
      success: false,
      error: errorMessage,
      message: `I couldn't create the calendar event. ${errorMessage || "Please make sure Google Calendar is connected."}`,
    };
  }
}

async function executeGetUpcomingEvents({
  maxResults,
}: GetUpcomingEventsParams) {
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
