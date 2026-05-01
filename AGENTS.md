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

**CRITICAL RULE - Data Fetching:**
- React Query hooks (`lib/queries/`) MUST fetch data through **tRPC only** - never import DAO functions directly
- Use `useTRPC()` hook and call tRPC procedures (e.g., `trpc.projects.queryOptions()`)
- DAO functions are for tRPC routes and server actions only
- Server actions (`lib/actions/`) can call DAO functions directly for writes
- Violating this breaks the application as DAO functions are `server-only` and cannot be imported directly in client-side code.

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

### Server-side data loading

When a page needs multiple server-side queries, do NOT `Promise.all` them and block rendering
until all resolve. Instead:

1. `await` only the fast/critical query directly (e.g., lightweight metadata).
2. Wrap heavier queries in inline async server components, each inside a `<Suspense>` boundary
   with a skeleton fallback.
3. Create skeleton components (`Skeleton` from `components/ui/skeleton`) that match the real
   content's dimensions to avoid layout shifts when data streams in.

This lets the shell render instantly while expensive data streams in progressively.

### Boilerplate-first rendering

For any page with data-bound widgets, default to **boilerplate-first**: render the static
structure synchronously in the page server component, and wrap only data-bound widgets in
`<Suspense>` islands. Extends the rules above with five concrete habits:

1. **Hoist static layout into the page.** Headings, descriptions, container chrome, form
   labels, navigation links, "back" buttons — all of this can render before any data
   resolves. Pull it out of feature components and write it directly in the page so a
   reader can see at a glance what costs data and what's free.
2. **One Suspense per data slice, not per feature.** A page with a model select, a toggle,
   two name inputs, and a memory list gets four Suspense islands — not one wrapping the
   whole form. Each island uses the React-cached DAO (`React.cache(...)`) so multiple
   loaders for the same query still hit the DB once per request.
3. **Match the full rendered box, not just the height class.** The rule is: when the
   skeleton swaps for the real widget, **nothing on the page should move**. That means
   matching everything that contributes to layout — height (including border + padding +
   content line-height, not just the upstream Tailwind class), width, border-radius, and
   the surrounding spacing (gap, margin, parent grid/flex). Don't trust shadcn defaults
   like `h-9` blindly — the project overrides them in places (e.g. `Input` renders at
   `h-10`, not `h-9`). When sizing skeletons, **read the actual component source and any
   global CSS that touches it**, or boot the app and measure the rendered element.
   If a skeleton causes the page to jump on load, the skeleton is wrong — fix it, don't
   ship it.
4. **For long-lived client components (accordions, lists), prefer an `isLoading` prop
   over Suspense replacement.** The component renders its full structure and shows
   skeleton placeholders only where data lives (count badges, row contents). The shell
   stays mounted across the loading transition — no DOM thrash, less perceived flicker.
   See `TypedMemoryBrowser` for the canonical example.
5. **Cross-island shared client state goes through a tiny Zustand store in
   `src/stores/`.** When two independently-suspended islands need to share state (e.g.
   the memory toggle disabling form inputs in another island), don't lift state into a
   parent client component just to thread props — put it in a store. The toggle
   initializes from server-loaded data on mount.

The verb is "hoist": every time you write a server component that awaits data and
returns a feature, ask whether the static parts of that feature can be hoisted up to the
page so they render with the shell.

## Creating and using components

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

## Critical files

The `useChat` hook from the AI SDK lives in `src/components/chat/message-list.tsx`; that file requires special attention.

The hook's internal state changes on every token received from the AI model, so the component that calls it would re-render on every token. Without the patterns below, the whole conversation re-renders on every token (poor performance and possible flicker).

Use refs for changing values and functions, `useCallback` for handlers, and `useMemo` for derived state and list JSX. That way only the last (currently streaming) message re-renders on every token; the rest of the conversation stays unchanged. This behavior must be maintained.
