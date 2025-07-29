import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import { getUserIdFromSession } from "../dao/users";

export const createTRPCContext = cache(async () => {
  const userId = await getUserIdFromSession();
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  if (!opts.ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return opts.next({
    ctx: {
      userId: opts.ctx.userId,
    },
  });
});
