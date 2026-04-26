import "server-only";

import OpenAI from "openai";

export type DeepResearchModel = "o4-mini-deep-research" | "o3-deep-research";

export const DEFAULT_DEEP_RESEARCH_MODEL: DeepResearchModel = "o4-mini-deep-research";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function createDeepResearch(params: {
  model: DeepResearchModel;
  query: string;
  withCodeInterpreter?: boolean;
}) {
  const tools: Array<Record<string, unknown>> = [{ type: "web_search_preview" }];
  if (params.withCodeInterpreter) {
    tools.push({ type: "code_interpreter", container: { type: "auto" } });
  }
  return getClient().responses.create({
    model: params.model,
    input: params.query,
    // biome-ignore lint/suspicious/noExplicitAny: SDK Tool union is overly strict; runtime accepts these tool types
    tools: tools as any,
    background: true,
    store: true,
  });
}

export async function retrieveDeepResearch(id: string) {
  return getClient().responses.retrieve(id);
}

export async function cancelDeepResearch(id: string) {
  return getClient().responses.cancel(id);
}

type ResponseLike = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export function extractDeepResearchText(response: ResponseLike): string {
  return (response.output ?? [])
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text" && typeof c.text === "string")
    .map((c) => c.text as string)
    .join("\n\n");
}
