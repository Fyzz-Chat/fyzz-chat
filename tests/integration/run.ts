import { spawnSync } from "node:child_process";

if (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY) {
  console.error(
    "Error: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be unset before running integration tests.\n" +
      "These credentials cause the server to enable S3, which affects file upload behavior under tests."
  );
  process.exit(1);
}

const modelFilter = process.argv[2];

const env: NodeJS.ProcessEnv = {
  ...process.env,
  RUN_INTEGRATION: "true",
};

if (modelFilter) {
  env.TEST_MODEL = modelFilter;
}

const result = spawnSync("bun", ["test", "tests/integration"], {
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
