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
  app/api/chat/route.ts   # Main chat API endpoint (streams AI responses)
  components/             # Next.js components
  components/ui/          # Shadcn UI components
  components/ai-elements/ # AI elements components
  hooks/                  # React hooks
  lib/                    # Library functions
  lib/queries/            # Client-side React Query hooks (optimistic updates, cache management)
  lib/actions/            # Next.js server actions (called from mutations)
  lib/dao/                # Database access layer (Prisma queries, called from tRPC and actions)
  lib/trpc/routers/       # tRPC route definitions (called from React Query hooks)
  lib/contexts/           # React contexts
  stores/                 # Zustand stores (client-side reactive state)
  types/                  # TypeScript types
```

### Data flow layers

Client-side data flows through these layers (top to bottom):

1. **Zustand stores** (`stores/`) — transient client state (selected model, UI flags)
2. **React Query hooks** (`lib/queries/`) — cached server state with optimistic updates
3. **tRPC routes** (`lib/trpc/routers/`) — server endpoints for reads
4. **Server actions** (`lib/actions/`) — server endpoints for writes
5. **DAOs** (`lib/dao/`) — Prisma database queries

### Client-side caching

React Query cache is persisted to **IndexedDB** (key: `"fyzz-chat-query-cache"`) via
`lib/trpc/query-persister.ts`, so data survives page reloads. Configuration is in
`lib/trpc/query-client.ts` (`staleTime: 15s`, `refetchOnMount: false`). Queries opt out of
persistence with `meta: { persist: false }`.

### Conversation lifecycle

- **New conversation:** Landing page stores initial message/model in `InitialMessageContext`
  (transient), navigates to `/chat/[id]`. `message-list.tsx` creates the conversation
  optimistically in React Query cache, then `handleSubmit` hits the chat API which creates
  the DB row via `getOrCreateConversation`.
- **Existing conversation:** `useConversation(id)` loads from IndexedDB cache or tRPC.
  Model is synced to Zustand store via a `useEffect` in `message-list.tsx`.

By default, rely on preinstalled Shadcn UI components and AI elements. If you cannot find a
matching component, use the `shadcn` or the `ai-elements` MCP tools to find and install the
missing component.

## Coding guidelines

- Use `bun` and `bunx` as package manager and CLI tool respectively.
- DO NOT write docstrings for functions or classes unless explicitly asked to do so.
- DO NOT write unnecessary comments like "Returns the user's name" for a function named `getName`.
- Only write comments for complex logic or when it's not obvious what the code does.
- Linter, formatter, and type checker are automatically executed after writing code.
  - Fix any errors or warnings until the code passes the checks.
- Install new dependencies with `bun add <package> --exact`, meaning the exact version of the package.
  - If a dependency is installed with ^, install that exact version and remove the ^.
- Write prisma functions in `/src/lib/dao/` or `src/lib/actions/` folders. Never import
  `prisma` directly in route handlers or components. Before implementing a database query,
  check if it already exists in the `dao` folder. If it does, use it. If it doesn't, create
  a new function in the `dao` folder, then import and use it wherever needed.

## Code organization

- Keep contexts in `/src/lib/contexts/` folder, hooks in `/src/hooks/` folder, and utils in `/src/lib/utils/` folder.
- Extract helper functions with no component dependencies to `/src/lib/utils/` or `/src/lib/` subfolders.
