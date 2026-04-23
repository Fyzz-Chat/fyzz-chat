import { tool } from "ai";
import { z } from "zod";
import {
  createTypedMemory,
  deleteMemory,
  updateOpinionConfidence,
} from "@/lib/dao/memories";
import { MemoryType } from "@/lib/prisma/generated/client";

const STRENGTHEN_DELTA = 0.1;
const WEAKEN_DELTA = -0.2;

export function createAgentMemoryTools(userId: string, projectId?: string) {
  return {
    store_fact: tool({
      description: `Record a factual detail about the user — preferences, role, location, personal context. Use when the user reveals something worth remembering across conversations.`,
      inputSchema: z.object({
        content: z.string().describe("The fact to remember"),
        category: z
          .string()
          .optional()
          .describe("Optional subcategory (e.g. 'personal', 'work', 'technical')"),
      }),
      execute: async ({ content, category }) => {
        await createTypedMemory(userId, {
          type: MemoryType.fact,
          content,
          category,
          source: "agent",
          projectId: projectId ?? null,
        });
        return "Fact stored.";
      },
    }),

    store_opinion: tool({
      description: `Record an opinion about the user's preference or behavior. Start new opinions at 0.5 confidence; strengthen/weaken them later with update_opinion.`,
      inputSchema: z.object({
        content: z.string().describe("The opinion (e.g. 'prefers terse responses')"),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .default(0.5)
          .describe("Confidence 0-1. Start new opinions at 0.5."),
        category: z
          .string()
          .optional()
          .describe("Optional subcategory (e.g. 'communication', 'workflow')"),
      }),
      execute: async ({ content, confidence, category }) => {
        await createTypedMemory(userId, {
          type: MemoryType.opinion,
          content,
          confidence,
          category,
          source: "agent",
          projectId: projectId ?? null,
        });
        return "Opinion recorded.";
      },
    }),

    store_learning: tool({
      description: `Capture a reusable insight from this session — something that would help future conversations but isn't a fact or a preference.`,
      inputSchema: z.object({
        content: z.string().describe("The learning to capture"),
      }),
      execute: async ({ content }) => {
        await createTypedMemory(userId, {
          type: MemoryType.learning,
          content,
          source: "agent",
          projectId: projectId ?? null,
        });
        return "Learning stored.";
      },
    }),

    store_feedback: tool({
      description: `Store behavioral guidance the user gave about how you should work — corrections, preferences for your approach, things to avoid. Different from opinions about the user; this is the user telling you how to behave.`,
      inputSchema: z.object({
        content: z.string().describe("The feedback to store"),
      }),
      execute: async ({ content }) => {
        await createTypedMemory(userId, {
          type: MemoryType.feedback,
          content,
          source: "agent",
          projectId: projectId ?? null,
        });
        return "Feedback stored.";
      },
    }),

    update_opinion: tool({
      description: `Adjust confidence on an existing opinion. Use 'strengthen' when the user confirms the opinion (+0.1), 'weaken' when the user contradicts it (-0.2).`,
      inputSchema: z.object({
        id: z.string().describe("The opinion ID from the context"),
        action: z.enum(["strengthen", "weaken"]),
      }),
      execute: async ({ id, action }) => {
        const delta = action === "strengthen" ? STRENGTHEN_DELTA : WEAKEN_DELTA;
        const updated = await updateOpinionConfidence(id, userId, delta);
        if (!updated) return "Opinion not found or not an opinion type.";
        return `Opinion confidence now ${updated.confidence?.toFixed(2) ?? "unknown"}.`;
      },
    }),

    delete_memory: tool({
      description: `Remove an outdated memory by id. Use when a fact is no longer true or an opinion has been retired.`,
      inputSchema: z.object({
        id: z.string().describe("The memory ID to delete"),
      }),
      execute: async ({ id }) => {
        try {
          await deleteMemory(id, userId);
          return "Memory deleted.";
        } catch {
          return "Memory not found.";
        }
      },
    }),
  };
}
