import type { Plugin } from "@opencode-ai/plugin";

export const LintPlugin: Plugin = async ({ $ }) => {
  return {
    "file.edited": async () => {
      await $`bun run check-write`;
      await $`bun run type-check`;
      await $`bun run test`;
      await $`bun run jscpd`;
      await $`bun run knip`;
      await $`bun run klint`;
    },
    "session.idle": async () => {
      await $`bun run build`;
    },
  };
};
