import { spawnSync } from "node:child_process";

const modelFilter = process.argv[2];

const env: NodeJS.ProcessEnv = {
  ...process.env,
  RUN_INTEGRATION: "true",
};

// AWS credentials cause the server to enable S3, which affects file upload
// behavior under tests. Strip them from the test env so runs are deterministic
// regardless of the developer's shell/.env.
if (env.AWS_ACCESS_KEY_ID || env.AWS_SECRET_ACCESS_KEY) {
  delete env.AWS_ACCESS_KEY_ID;
  delete env.AWS_SECRET_ACCESS_KEY;
  console.log("Unset AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY for the test run.");
}

if (modelFilter) {
  env.TEST_MODEL = modelFilter;
}

const result = spawnSync("bun", ["test", "tests/integration"], {
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
