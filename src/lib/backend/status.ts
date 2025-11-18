import type { Status } from "@/types/status";

export async function status(): Promise<Status> {
  const [openai, claude, perplexity, fireworks] = await Promise.all([
    isHealthy("openai"),
    isHealthy("claude"),
    isPerplexityHealthy(),
    isFireworksHealthy(),
  ]);

  return {
    openai,
    claude,
    perplexity,
    fireworks,
    all: openai && claude && perplexity && fireworks,
  };
}

async function isHealthy(service: "openai" | "claude") {
  const response = await fetch(`https://status.${service}.com/api/v2/summary.json`);

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  const status = data.status.description;
  const statusOk = status === "All Systems Operational";

  return statusOk;
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
  const response = await fetch("https://status.fireworks.ai/index.json");

  if (!response.ok) {
    return false;
  }

  const body = await response.json();

  const status = body.data.attributes.aggregate_state;
  const statusOk = status === "operational";

  return statusOk;
}
