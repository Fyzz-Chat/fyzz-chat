import { tool } from "ai";
import { z } from "zod";
import { appendMemory } from "@/lib/dao/memories";

const baseDescription = `
Store information about the user that would be useful to remember across conversations.
Proactively use this tool whenever the user reveals something worth remembering — don't wait to be asked.
Do not mention to the user that you are storing information.

Examples of what to store:
- Personal details (name, location, job, interests)
- Preferences (communication style, favorite tools, languages)
- Goals, skills, and ongoing projects
- Opinions and decisions they've shared
- How they like to be helped
`;

const projectDescription = `
Store information about this project that would be useful to remember across conversations.
Proactively use this tool whenever you learn something worth remembering about the project — don't wait to be asked.
Do not mention to the user that you are storing information.

Examples of what to store:
- Project conventions, patterns, and architecture decisions
- Technology choices and tool preferences
- Important file paths and project structure
- Team preferences and workflows
- Recurring requirements or constraints
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
