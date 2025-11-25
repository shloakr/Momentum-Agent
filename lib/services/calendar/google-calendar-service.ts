import { google } from "googleapis";
import type {
  CalendarEventRequest,
  CalendarEventResponse,
  RecurrencePattern,
  DayOfWeek,
} from "../habits/habit-types";

let connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=google-calendar",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("Google Calendar not connected");
  }
  return accessToken;
}

async function getCalendarClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export class GoogleCalendarService {
  async createEvent(
    request: CalendarEventRequest
  ): Promise<CalendarEventResponse> {
    const calendar = await getCalendarClient();

    const event: any = {
      summary: request.summary,
      description: request.description || "",
      start: {
        dateTime: request.startDateTime,
        timeZone: request.timezone,
      },
      end: {
        dateTime: request.endDateTime,
        timeZone: request.timezone,
      },
    };

    if (request.recurrence && request.recurrence.length > 0) {
      event.recurrence = request.recurrence;
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return {
      id: response.data.id || "",
      htmlLink: response.data.htmlLink || "",
      summary: response.data.summary || "",
      start: {
        dateTime: response.data.start?.dateTime || "",
        timeZone: response.data.start?.timeZone || request.timezone,
      },
      end: {
        dateTime: response.data.end?.dateTime || "",
        timeZone: response.data.end?.timeZone || request.timezone,
      },
    };
  }

  async listEvents(
    maxResults: number = 10,
    timeMin?: Date
  ): Promise<CalendarEventResponse[]> {
    const calendar = await getCalendarClient();

    const response = await calendar.events.list({
      calendarId: "primary",
      maxResults,
      timeMin: timeMin?.toISOString() || new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return (response.data.items || []).map((event) => ({
      id: event.id || "",
      htmlLink: event.htmlLink || "",
      summary: event.summary || "",
      start: {
        dateTime: event.start?.dateTime || event.start?.date || "",
        timeZone: event.start?.timeZone || "",
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || "",
        timeZone: event.end?.timeZone || "",
      },
    }));
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const calendar = await getCalendarClient();
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
    return true;
  }

  buildRecurrenceRule(pattern: RecurrencePattern): string[] {
    const parts: string[] = [];
    let freq = "";

    switch (pattern.type) {
      case "daily":
        freq = "DAILY";
        break;
      case "weekly":
        freq = "WEEKLY";
        break;
      case "biweekly":
        freq = "WEEKLY";
        parts.push("INTERVAL=2");
        break;
      case "monthly":
        freq = "MONTHLY";
        break;
    }

    if (pattern.interval && pattern.type !== "biweekly") {
      parts.push(`INTERVAL=${pattern.interval}`);
    }

    if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
      parts.push(`BYDAY=${pattern.daysOfWeek.join(",")}`);
    }

    const rule = `RRULE:FREQ=${freq}${parts.length > 0 ? ";" + parts.join(";") : ""}`;
    return [rule];
  }

  parseTimeToDateTime(
    time: string,
    date: Date,
    timezone: string
  ): string {
    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime.toISOString();
  }
}

export const googleCalendarService = new GoogleCalendarService();
