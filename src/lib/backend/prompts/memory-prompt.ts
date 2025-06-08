import { getUserMemory } from "@/lib/dao/users";

export async function getMemoryPrompt() {
  const memory = await getUserMemory();

  if (!memory) {
    return "";
  }

  return `
Here is some information about the user that was stored in the past based on previous conversations.

${memory}

Use this information if applicable to the current conversation.`;
}
