import systemPrompt from "@/lib/backend/prompts/system-prompt";
import { getModel } from "@/lib/backend/providers";
import { filterMessages, logDuration } from "@/lib/backend/utils";
import { getUserFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { smoothStream, streamText } from "ai";
import type { NextRequest } from "next/server";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const start = performance.now();
  await getUserFromSession();
  logDuration(start, "User fetched");

  const { messages, model: modelId, browse } = await req.json();
  const { model } = getModel(modelId, browse);

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const filteredMessages = filterMessages(messages, modelId);

  const result = streamText({
    model,
    messages: filteredMessages,
    maxSteps: 5,
    system: systemPrompt,
    temperature: modelId === "o4-mini" ? 1 : undefined,
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    onError: async (error) => {
      logger.error(error);
    },
  });

  logDuration(start, "Response time");

  result.consumeStream();

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendSources: true,
    getErrorMessage: (error: any) => error.data.error.code,
  });
}
