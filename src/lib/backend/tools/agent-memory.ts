import { tool } from "ai";
import { z } from "zod";
import {
  createTypedMemory,
  deleteMemory,
  getOpinionConfidence,
  setOpinionConfidence,
} from "@/lib/dao/memories";
import { MemoryType } from "@/lib/prisma/generated/client";

const STRENGTHEN_DELTA = 0.1;
const WEAKEN_DELTA = -0.2;
const OPINION_RETIRE_THRESHOLD = 0.2;
const MAX_MEMORY_CHARS = 500;

function clampContent(content: string): string {
  return content.length > MAX_MEMORY_CHARS ? content.slice(0, MAX_MEMORY_CHARS) : content;
}

const LENGTH_GUIDANCE = `Keep content under ${MAX_MEMORY_CHARS} characters — break longer thoughts into multiple memories. Longer content is silently truncated.`;

export function createAgentMemoryTools(
  userId: string,
  projectId?: string,
  conversationId?: string
) {
  return {
    store_fact: tool({
      description: `Record a factual detail about the user — preferences, role, location, personal context. Use when the user reveals something worth remembering across conversations. ${LENGTH_GUIDANCE}`,
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
          content: clampContent(content),
          category,
          source: "agent",
          projectId: projectId ?? null,
          conversationId: conversationId ?? null,
        });
        return "Fact stored.";
      },
    }),

    store_opinion: tool({
      description: `Record an opinion about the user's preference or behavior. Start new opinions at 0.5 confidence; strengthen/weaken them later with update_opinion. ${LENGTH_GUIDANCE}`,
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
          content: clampContent(content),
          confidence,
          category,
          source: "agent",
          projectId: projectId ?? null,
          conversationId: conversationId ?? null,
        });
        return "Opinion recorded.";
      },
    }),

    store_learning: tool({
      description: `Capture a reusable insight from this session — something that would help future conversations but isn't a fact or a preference. ${LENGTH_GUIDANCE}`,
      inputSchema: z.object({
        content: z.string().describe("The learning to capture"),
      }),
      execute: async ({ content }) => {
        await createTypedMemory(userId, {
          type: MemoryType.learning,
          content: clampContent(content),
          source: "agent",
          projectId: projectId ?? null,
          conversationId: conversationId ?? null,
        });
        return "Learning stored.";
      },
    }),

    store_feedback: tool({
      description: `Store behavioral guidance the user gave about how you should work — corrections, preferences for your approach, things to avoid. Different from opinions about the user; this is the user telling you how to behave. ${LENGTH_GUIDANCE}`,
      inputSchema: z.object({
        content: z.string().describe("The feedback to store"),
      }),
      execute: async ({ content }) => {
        await createTypedMemory(userId, {
          type: MemoryType.feedback,
          content: clampContent(content),
          source: "agent",
          projectId: projectId ?? null,
          conversationId: conversationId ?? null,
        });
        return "Feedback stored.";
      },
    }),

    update_opinion: tool({
      description: `Adjust confidence on an existing opinion. Use 'strengthen' when the user confirms the opinion (+0.1), 'weaken' when the user contradicts it (-0.2). If weakening would drop confidence below 0.2 the opinion is retired (deleted) instead — you'll see a retired result and the id will no longer be valid.`,
      inputSchema: z.object({
        id: z.string().describe("The opinion ID from the context"),
        action: z.enum(["strengthen", "weaken"]),
      }),
      execute: async ({ id, action }) => {
        const current = await getOpinionConfidence(id, userId);
        if (current === null) return "Opinion not found or not an opinion type.";

        const delta = action === "strengthen" ? STRENGTHEN_DELTA : WEAKEN_DELTA;
        const next = Math.max(0, Math.min(1, current + delta));

        if (next < OPINION_RETIRE_THRESHOLD) {
          await deleteMemory(id, userId);
          return `Opinion retired — confidence fell below 0.2 (was ${current.toFixed(2)}). Memory has been deleted.`;
        }

        await setOpinionConfidence(id, userId, next);
        return `Opinion confidence now ${next.toFixed(2)}.`;
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
