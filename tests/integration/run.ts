import { spawnSync } from "node:child_process";

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
