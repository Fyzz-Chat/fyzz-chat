import { getMemoriesByType, getProjectMemoriesByType } from "@/lib/dao/memories";
import { getRecentLowRatedMessages } from "@/lib/dao/ratings";
import { MemoryType } from "@/lib/prisma/generated/client";

type MemoryRow = {
  id: string;
  content: string;
  confidence: number | null;
  category: string | null;
  createdAt: Date;
};

const FACT_LIMIT = 50;
const OPINION_LIMIT = 30;
const FEEDBACK_LIMIT = 20;
const LEARNING_LIMIT = 10;
const LOW_RATED_LIMIT = 5;
const LOW_RATED_SNIPPET_CHARS = 240;

const CATEGORY_CHAR_BUDGET = {
  fact: 10000,
  opinion: 6000,
  learning: 3000,
  feedback: 4000,
  context: 2000,
} as const;

const TRUNCATION_SUFFIX = "[…]";

// Water-filling char allocation: each item gets at most charBudget/count, but
// items smaller than their share pass through untouched and their leftover
// is redistributed — so one huge memory can't starve newer ones out of the prompt.
function packFairly<T>(
  items: T[],
  format: (item: T) => string,
  charBudget: number
): string[] {
  if (items.length === 0) return [];
  const formatted = items.map(format);
  const indexed = formatted.map((text, i) => ({ i, text }));
  indexed.sort((a, b) => a.text.length - b.text.length);
  const result: string[] = new Array(items.length);
  let remaining = charBudget;
  let count = indexed.length;
  for (const { i, text } of indexed) {
    const share = Math.floor(remaining / Math.max(count, 1));
    if (text.length <= share) {
      result[i] = text;
      remaining -= text.length;
    } else {
      const cutoff = Math.max(0, share - TRUNCATION_SUFFIX.length);
      result[i] = text.slice(0, cutoff) + TRUNCATION_SUFFIX;
      remaining -= share;
    }
    count--;
  }
  return result;
}

function formatFact(m: MemoryRow): string {
  const cat = m.category ? ` [${m.category}]` : "";
  return `- [id: ${m.id}]${cat} ${m.content}`;
}

function formatOpinion(m: MemoryRow): string {
  const conf = m.confidence !== null ? m.confidence.toFixed(2) : "?";
  const cat = m.category ? `, ${m.category}` : "";
  return `- [id: ${m.id}] (${conf}${cat}) ${m.content}`;
}

function formatDated(m: MemoryRow): string {
  const date = m.createdAt.toISOString().slice(0, 10);
  return `- [id: ${m.id}] [${date}] ${m.content}`;
}

function formatPlain(m: MemoryRow): string {
  return `- [id: ${m.id}] ${m.content}`;
}

function section(title: string, lines: string[]): string | null {
  if (lines.length === 0) return null;
  return `## ${title}\n${lines.join("\n")}`;
}

function formatLowRated(r: { createdAt: Date; message: { content: string | null } }) {
  const date = r.createdAt.toISOString().slice(0, 10);
  const raw = r.message.content ?? "";
  const snippet =
    raw.length > LOW_RATED_SNIPPET_CHARS
      ? `${raw.slice(0, LOW_RATED_SNIPPET_CHARS)}…`
      : raw;
  return `- [${date}] ${snippet.replace(/\s+/g, " ").trim()}`;
}

const MEMORY_INSTRUCTIONS = `## Memory tools

You have tools to maintain your knowledge about the user across conversations. Use them proactively — do not ask permission.

- store_fact — personal details, preferences, role, context
- store_opinion — behavioral patterns or preferences you've noticed (start new opinions at 0.5 confidence)
- store_learning — reusable insights from this session
- store_feedback — guidance the user gave you about how to work
- update_opinion — strengthen (+0.1) when the user confirms, weaken (-0.2) when they contradict
- delete_memory — remove outdated memories by id

Reference memories by their [id: ...] when updating or deleting.`;

export async function getAgentMemoryPrompt(
  userId: string,
  projectId?: string
): Promise<string> {
  const [facts, opinions, feedback, learnings, context, lowRated] = await Promise.all([
    getMemoriesByType(userId, MemoryType.fact, { limit: FACT_LIMIT }),
    getMemoriesByType(userId, MemoryType.opinion, { limit: OPINION_LIMIT }),
    getMemoriesByType(userId, MemoryType.feedback, { limit: FEEDBACK_LIMIT }),
    getMemoriesByType(userId, MemoryType.learning, {
      limit: LEARNING_LIMIT,
      recent: true,
    }),
    getMemoriesByType(userId, MemoryType.context),
    getRecentLowRatedMessages(userId, LOW_RATED_LIMIT),
  ]);

  const [projectFacts, projectLearnings, projectContext] = projectId
    ? await Promise.all([
        getProjectMemoriesByType(projectId, MemoryType.fact, { limit: FACT_LIMIT }),
        getProjectMemoriesByType(projectId, MemoryType.learning, {
          limit: LEARNING_LIMIT,
          recent: true,
        }),
        getProjectMemoriesByType(projectId, MemoryType.context),
      ])
    : [[], [], []];

  const sections: (string | null)[] = [
    section(
      "Facts about the user",
      packFairly(facts, formatFact, CATEGORY_CHAR_BUDGET.fact)
    ),
    section(
      "User preferences (opinions)",
      packFairly(opinions, formatOpinion, CATEGORY_CHAR_BUDGET.opinion)
    ),
    section(
      "Feedback from the user about how to work",
      packFairly(feedback, formatPlain, CATEGORY_CHAR_BUDGET.feedback)
    ),
    section(
      "Previous responses the user marked as bad — avoid repeating these patterns",
      lowRated.map(formatLowRated)
    ),
    section(
      "Recent learnings",
      packFairly(learnings, formatDated, CATEGORY_CHAR_BUDGET.learning)
    ),
    section(
      "User context",
      packFairly(context, formatPlain, CATEGORY_CHAR_BUDGET.context)
    ),
    projectId
      ? section(
          "Facts about this project",
          packFairly(projectFacts, formatFact, CATEGORY_CHAR_BUDGET.fact)
        )
      : null,
    projectId
      ? section(
          "Recent project learnings",
          packFairly(projectLearnings, formatDated, CATEGORY_CHAR_BUDGET.learning)
        )
      : null,
    projectId
      ? section(
          "Project context",
          packFairly(projectContext, formatPlain, CATEGORY_CHAR_BUDGET.context)
        )
      : null,
  ];

  const body = sections.filter((s): s is string => s !== null).join("\n\n");

  if (body.length === 0) {
    return `\n\n${MEMORY_INSTRUCTIONS}`;
  }

  return `\n\nYou are operating with persistent memory. Here is what you know about the user and their work:\n\n${body}\n\n${MEMORY_INSTRUCTIONS}`;
}
