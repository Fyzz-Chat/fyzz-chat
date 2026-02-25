export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  await import("./instrumentation.node");
}
