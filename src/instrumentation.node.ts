import "server-only";

const TELEMETRY_URL = "https://stats.fyzz.chat/api/telemetry";

async function ping() {
  try {
    const { getOrCreateDeploymentId } = await import("@/lib/dao/system-settings");
    const deploymentId = await getOrCreateDeploymentId();
    if (!deploymentId) return;

    const { getVersion } = await import("@/lib/backend/utils");
    const version = getVersion();

    await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deploymentId, version }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // telemetry must never break the app
  }
}

await ping();
