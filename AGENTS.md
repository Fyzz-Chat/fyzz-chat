This application is a unified chatbot platform that allows users to chat with AI models from
any of the configured providers.

## Architecture

The application is built with the following stack:
- [Catalyst](https://github.com/kovrichard/catalyst) for the core framework. This includes:
    * Bun.js
    * Prisma
    * Next.js
    * Tailwind CSS
    * Shadcn UI
    * tRPC
    * Husky
    * Biome
    * Better Auth
    * Zod
    * Winston
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) for accessing the AI models.

Folder structure:

```bash
src/                      # Source root
  app/                    # Next.js app directory
  components/             # Next.js components
  components/ui/          # Shadcn UI components
  components/ai-elements/ # AI elements components
  hooks/                  # React hooks
  lib/                    # Library functions
  stores/                 # React stores
  types/                  # TypeScript types
```

By default, rely on preinstalled Shadcn UI components and AI elements. If you cannot find a
matching component, use the `shadcn` or the `ai-elements` MCP tools to find and install the
missing component.

## Coding guidelines

- DO NOT write docstrings for functions or classes unless explicitly asked to do so.
- DO NOT write unnecessary comments like "Returns the user's name" for a function named `getName`.
- Only write comments for complex logic or when it's not obvious what the code does.
- Run the linter and formatter after writing code to fix any errors or warnings.
  - Run `bun run type-check` to check for type errors.
  - Run `bun run check` to check the code.
  - Fix any errors or warnings until the code passes the checks.
  - You may use `bun run check-write` to fix the code.
- Install new dependencies with `bun add <package> --exact`, meaning the exact version of the package.
  - If a dependency is installed with ^, install that exact version and remove the ^.

## Code organization

- Keep contexts in `/src/lib/contexts/` folder, hooks in `/src/hooks/` folder, and utils in `/src/lib/utils/` folder.
- Extract helper functions with no component dependencies to `/src/lib/utils/` or `/src/lib/` subfolders.
