import { getProjectMemories, getUserMemories } from "@/lib/dao/memories";

function formatMemories(memories: { content: string; createdAt: Date }[]): string {
  return memories
    .map((m) => {
      const dateTime = m.createdAt.toLocaleString("hu-HU", { timeZone: "UTC" });
      return `${dateTime}: ${m.content}`;
    })
    .join("\n");
}

export async function getMemoryPrompt(userId: string, projectId?: string) {
  const userMemories = await getUserMemories(userId);

  const sections: string[] = [];

  if (userMemories.length > 0) {
    sections.push(
      `Here is some information about the user that was stored in the past based on previous conversations.\n\n${formatMemories(userMemories)}`
    );
  }

  if (projectId) {
    const projectMemories = await getProjectMemories(projectId);
    if (projectMemories.length > 0) {
      sections.push(
        `Here is some information about the current project that was stored in the past based on previous conversations.\n\n${formatMemories(projectMemories)}`
      );
    }
  }

  if (sections.length === 0) {
    return "";
  }

  return `\n${sections.join("\n\n")}\n\nUse this information if applicable to the current conversation.`;
}
