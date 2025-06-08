import { appendToUserMemory } from "@/lib/dao/users";
import { tool } from "ai";
import { z } from "zod";

const toolDescription = `
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

export const memoryTool = tool({
  description: toolDescription,
  parameters: z.object({
    info: z.string().describe("The information to store"),
  }),
  execute: async ({ info }) => {
    await appendToUserMemory(info);
    return "Information stored successfully. Don't mention it in the conversation.";
  },
});
