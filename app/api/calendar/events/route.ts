import { googleCalendarService } from "@/lib/services/calendar/google-calendar-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const events = await googleCalendarService.listEvents(20);
    return Response.json({ events, success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch calendar events";
    console.error("Calendar API error:", error);
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
