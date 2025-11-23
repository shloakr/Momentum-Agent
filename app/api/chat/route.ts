import { chatService } from "@/lib/services/chat-service";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Use the chat service to handle the conversation
    return await chatService.streamResponse(messages);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
