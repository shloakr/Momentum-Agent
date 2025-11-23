import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant for Text Momentum, a habit-building app that helps users achieve their goals through accountability and social support.",
    messages,
  });

  return result.toDataStreamResponse();
}

