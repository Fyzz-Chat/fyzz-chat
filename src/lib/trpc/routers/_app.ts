import { getConversation, getConversationsByCursor } from "@/lib/dao/conversations";
import { getMessages } from "@/lib/dao/messages";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";
import { z } from "zod";

export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  messages: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        page: z.number().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async (opts) => {
      const { id, page, limit } = opts.input;
      const messages = await getMessages(id, page, limit);
      return messages;
    }),
  conversation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (opts) => {
      const { id } = opts.input;
      const conversation = await getConversation(id);
      return conversation;
    }),
  infiniteConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(15),
        cursor: z.string().optional(),
        search: z.string().default(""),
      })
    )
    .query(async (opts) => {
      const { limit, cursor, search } = opts.input;
      const { items, nextCursor } = await getConversationsByCursor(limit, cursor, search);
      return { items, nextCursor };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
