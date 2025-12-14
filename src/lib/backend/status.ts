import type { Status } from "@/types/status";

export async function status(): Promise<Status> {
  const [openai, anthropic, perplexity, fireworks] = await Promise.all([
    isOpenAIHealthy(),
    isAnthropicHealthy(),
    isPerplexityHealthy(),
    isFireworksHealthy(),
  ]);

  return {
    all: openai && anthropic && perplexity && fireworks,
    providers: {
      azure: openai,
      openai,
      anthropic,
      google: true,
      xai: true,
      perplexity,
      fireworks,
    },
  };
}

async function isOpenAIHealthy() {
  const openai_api_components = new Set(["Chat Completions", "Responses", "Files"]);

  const response = await fetch("https://status.openai.com/api/v2/summary.json");

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  const components: { name: string; status: string }[] = data.components || [];

  const apiComponents = components.filter((c) => openai_api_components.has(c.name));

  return apiComponents.every((c) => c.status === "operational");
}

async function isAnthropicHealthy() {
  const claude_api_components = new Set(["Claude API (api.anthropic.com)"]);

  const response = await fetch("https://status.claude.com/api/v2/summary.json");

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  const components: { name: string; status: string }[] = data.components || [];

  const apiComponents = components.filter((c) => claude_api_components.has(c.name));

  return apiComponents.every((c) => c.status === "operational");
}

async function isPerplexityHealthy() {
  const response = await fetch("https://status.perplexity.com/summary.json");

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  const status = data.page.status;
  const statusOk = status === "UP";

  return statusOk;
}

async function isFireworksHealthy() {
  return true;

  // const response = await fetch("https://status.fireworks.ai/index.json");

  // if (!response.ok) {
  //   return false;
  // }

  // const body = await response.json();

  // const status = body.data.attributes.aggregate_state;
  // const statusOk = status === "operational";

  // return statusOk;
}
