import { getMemoriesByType, getProjectMemoriesByType } from "@/lib/dao/memories";
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
  const [facts, opinions, feedback, learnings, context] = await Promise.all([
    getMemoriesByType(userId, MemoryType.fact, { limit: FACT_LIMIT }),
    getMemoriesByType(userId, MemoryType.opinion, { limit: OPINION_LIMIT }),
    getMemoriesByType(userId, MemoryType.feedback, { limit: FEEDBACK_LIMIT }),
    getMemoriesByType(userId, MemoryType.learning, {
      limit: LEARNING_LIMIT,
      recent: true,
    }),
    getMemoriesByType(userId, MemoryType.context),
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
    section("Facts about the user", facts.map(formatFact)),
    section("User preferences (opinions)", opinions.map(formatOpinion)),
    section("Feedback from the user about how to work", feedback.map(formatPlain)),
    section("Recent learnings", learnings.map(formatDated)),
    section("User context", context.map(formatPlain)),
    projectId ? section("Facts about this project", projectFacts.map(formatFact)) : null,
    projectId
      ? section("Recent project learnings", projectLearnings.map(formatDated))
      : null,
    projectId ? section("Project context", projectContext.map(formatPlain)) : null,
  ];

  const body = sections.filter((s): s is string => s !== null).join("\n\n");

  if (body.length === 0) {
    return `\n\n${MEMORY_INSTRUCTIONS}`;
  }

  return `\n\nYou are operating with persistent memory. Here is what you know about the user and their work:\n\n${body}\n\n${MEMORY_INSTRUCTIONS}`;
}
