import { chatService } from "@/lib/services/chat-service";
import { googleCalendarService } from "@/lib/services/calendar/google-calendar-service";

export const runtime = "nodejs";
export const maxDuration = 60;

// Keywords that indicate the user is asking about their calendar
const CALENDAR_KEYWORDS = [
  "calendar",
  "event",
  "schedule",
  "upcoming",
  "what's on",
  "what is on",
  "check calendar",
  "show calendar",
  "my schedule",
  "my events",
  "when is",
  "what do i have",
];

function isCalendarQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CALENDAR_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Check if the user is asking about their calendar
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg: { role: string }) => msg.role === "user");

    let calendarContext = "";
    if (lastUserMessage && isCalendarQuery(lastUserMessage.content)) {
      try {
        const events = await googleCalendarService.listEvents(5);
        if (events && events.length > 0) {
          const eventsList = events
            .map(
              (event: {
                summary: string;
                start: { dateTime: string };
              }) => {
                const date = new Date(event.start.dateTime);
                const dateStr = date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return `- ${event.summary} (${dateStr})`;
              }
            )
            .join("\n");

          calendarContext = `\n\n[User's upcoming calendar events:]\n${eventsList}\n\nInclude a mention of these events in your response, and suggest they can view their full calendar in the app for more details.`;
        }
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        // Continue without calendar context if fetch fails
      }
    }

    // Use the chat service to handle the conversation
    return await chatService.streamResponse(messages, calendarContext);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
