import "server-only";

import type { InputJsonValue } from "@prisma/client/runtime/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  extractDeepResearchText,
  retrieveDeepResearch,
} from "@/lib/backend/openai-research";
import {
  getResearchMessage,
  markResearchComplete,
  markResearchFailed,
} from "@/lib/dao/research";
import { logger } from "@/lib/logger";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";

export const researchRouter = createTRPCRouter({
  poll: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .query(async (opts) => {
      const userId = opts.ctx.user.id;
      const message = await getResearchMessage(opts.input.messageId, userId);
      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (message.status !== "pending" || !message.externalId) {
        return message;
      }

      let response: Awaited<ReturnType<typeof retrieveDeepResearch>>;
      try {
        response = await retrieveDeepResearch(message.externalId);
      } catch (error) {
        logger.error({ message: "Deep research retrieve failed", error });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      if (response.status === "completed") {
        const text = extractDeepResearchText(response);
        const parts: InputJsonValue = [{ type: "text", text }];
        const usage = response.usage as
          | { input_tokens?: number; output_tokens?: number }
          | null
          | undefined;
        const updated = await markResearchComplete(message.id, {
          parts,
          content: text,
          promptTokens: usage?.input_tokens ?? 0,
          completionTokens: usage?.output_tokens ?? 0,
        });
        return { ...message, ...updated };
      }

      if (response.status === "failed" || response.status === "cancelled") {
        const reason = response.error?.message ?? response.status;
        const updated = await markResearchFailed(message.id, reason);
        return { ...message, ...updated };
      }

      return message;
    }),
});
