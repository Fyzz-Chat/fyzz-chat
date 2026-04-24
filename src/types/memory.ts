export const MemoryType = {
  fact: "fact",
  opinion: "opinion",
  learning: "learning",
  context: "context",
  feedback: "feedback",
} as const;

export type MemoryType = (typeof MemoryType)[keyof typeof MemoryType];
