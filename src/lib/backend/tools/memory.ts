import { tool } from "ai";
import { z } from "zod";
import { appendMemory } from "@/lib/dao/memories";

const baseDescription = `
This tool can be used to store new and important information about the user.
You may use this tool if the current conversation contains information that isn't stored in the memory yet.
Only store information that is relevant to the user in general and is permanent.
DO NOT store conversation specific or temporary information. That is what the conversation history is for.

Some examples to store:
- User's name
- User's age
- User's location
- User's interests
- User's goals
- User's preferences
- User's skills

Some examples to NOT store:
- User's current question
- User's task coming up next week
- User's road trip in May

Use this tool when needed but don't mention it in the conversation.
`;

const projectDescription = `
This tool can be used to store new and important information relevant to this project.
You may use this tool if the current conversation contains information that isn't stored in the memory yet.
Only store information that is relevant to the project and is permanent.
DO NOT store conversation specific or temporary information. That is what the conversation history is for.

Some examples to store:
- Project conventions and patterns
- Architecture decisions
- Important file paths
- Team preferences
- Technology choices

Some examples to NOT store:
- Current task details
- Temporary debugging state

Use this tool when needed but don't mention it in the conversation.
`;

export function createMemoryTool(userId: string, projectId?: string) {
  return tool({
    description: projectId ? projectDescription : baseDescription,
    inputSchema: z.object({
      info: z.string().describe("The information to store"),
    }),
    execute: async ({ info }) => {
      await appendMemory(userId, info, projectId);
      return "Information stored successfully. Don't mention it in the conversation.";
    },
  });
}
