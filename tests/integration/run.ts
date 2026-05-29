import { spawn, spawnSync } from "node:child_process";

const modelFilter = process.argv[2];
const port = Number(process.env.TEST_PORT ?? 3100);
const baseUrl = `http://localhost:${port}`;

// Boot a dedicated server with S3 disabled (DISABLE_S3 forces config.s3Configured
// off) so file uploads take the local path under tests. A separate port keeps it
// from clashing with a dev server already running on 3000.
//
// Server output is suppressed by default to keep the test report clean. It is
// buffered so it can be dumped if the server fails to start, and streamed live
// when TEST_SERVER_LOGS=true.
const verboseServer = process.env.TEST_SERVER_LOGS === "true";
const serverLogs: string[] = [];

console.log(`Starting integration server on ${baseUrl} (S3 disabled)...`);
const server = spawn("bunx", ["next", "dev", "-p", String(port)], {
  env: { ...process.env, DISABLE_S3: "true" },
  stdio: [
    "ignore",
    verboseServer ? "inherit" : "pipe",
    verboseServer ? "inherit" : "pipe",
  ],
  detached: true,
});

function captureServerOutput(stream: NodeJS.ReadableStream | null) {
  stream?.on("data", (chunk: Buffer) => {
    serverLogs.push(chunk.toString());
    if (serverLogs.length > 200) {
      serverLogs.shift();
    }
  });
}
captureServerOutput(server.stdout);
captureServerOutput(server.stderr);

function stopServer() {
  if (server.pid && !server.killed) {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      // already gone
    }
  }
  // Next forks a worker that can escape the process group, so also kill whatever
  // is still bound to the test port.
  const lsof = spawnSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" });
  const pids = (lsof.stdout ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGKILL");
    } catch {
      // already gone
    }
  }
}

process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stopServer();
  process.exit(143);
});

async function waitForServer(url: string, timeoutMs = 120_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url, { method: "GET" });
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return false;
}

const ready = await waitForServer(baseUrl);
if (!ready) {
  console.error(`Server did not become ready at ${baseUrl} within timeout.`);
  if (!verboseServer && serverLogs.length > 0) {
    console.error("--- server output ---");
    console.error(serverLogs.join(""));
    console.error("--- end server output ---");
  }
  stopServer();
  process.exit(1);
}

const env: NodeJS.ProcessEnv = {
  ...process.env,
  RUN_INTEGRATION: "true",
  TEST_BASE_URL: baseUrl,
};

if (modelFilter) {
  env.TEST_MODEL = modelFilter;
}

const result = spawnSync("bun", ["test", "tests/integration"], {
  env,
  stdio: "inherit",
});

stopServer();
process.exit(result.status ?? 1);
