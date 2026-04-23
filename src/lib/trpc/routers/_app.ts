import "server-only";

import { z } from "zod";
import { countModels, getProvidersPublic } from "@/lib/backend/providers";
import { status } from "@/lib/backend/status";
import { getApiKeysByUser } from "@/lib/dao/api-keys";
import { getConversation, getConversationsByCursor } from "@/lib/dao/conversations";
import { getProjectMemories } from "@/lib/dao/memories";
import { getMessages } from "@/lib/dao/messages";
import { getProject, getProjects } from "@/lib/dao/projects";
import { getSharesByConversationId } from "@/lib/dao/shares";
import {
  getAllProjectSkillsForSettings,
  getAllUserSkillsForSettings,
} from "@/lib/dao/skills";
import { getUploadUrls } from "@/lib/services/uploads";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/init";

export const appRouter = createTRPCRouter({
  status: publicProcedure.query(() => status()),
  providers: publicProcedure.query(() => getProvidersPublic()),
  numModels: publicProcedure.query(() => countModels()),
  defaultModel: protectedProcedure.query(async (opts) => {
    return opts.ctx.user.defaultModel;
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
  getUploadUrls: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        count: z.number(),
        fileIds: z.array(z.string()).optional(),
      })
    )
    .query(async (opts) => {
      const { conversationId, count, fileIds } = opts.input;
      return getUploadUrls(opts.ctx.user.id, conversationId, count, fileIds);
    }),
  infiniteConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(15),
        cursor: z.string().optional(),
        search: z.string().default(""),
        projectId: z.string().optional().nullable(),
      })
    )
    .query(async (opts) => {
      const { limit, cursor, search, projectId } = opts.input;
      const { items, nextCursor } = await getConversationsByCursor(
        limit,
        cursor,
        search,
        projectId
      );
      return { items, nextCursor };
    }),
  shares: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async (opts) => {
      const { conversationId } = opts.input;
      const shares = await getSharesByConversationId(conversationId);
      return { shares };
    }),
  project: protectedProcedure.input(z.object({ id: z.string() })).query(async (opts) => {
    return getProject(opts.input.id);
  }),
  projectMemories: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async (opts) => {
      return getProjectMemories(opts.input.projectId);
    }),
  projects: protectedProcedure.query(async () => {
    const projects = await getProjects();
    return { projects };
  }),
  apiKeys: protectedProcedure.query(async (opts) => {
    return getApiKeysByUser(opts.ctx.user.id);
  }),
  skills: protectedProcedure.query(async (opts) => {
    return getAllUserSkillsForSettings(opts.ctx.user.id);
  }),
  projectSkills: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async (opts) => {
      return getAllProjectSkillsForSettings(opts.input.projectId);
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
