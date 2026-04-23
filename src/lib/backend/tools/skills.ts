import { tool } from "ai";
import { z } from "zod";
import { getSkillById, touchSkillActivation } from "@/lib/dao/skills";

const description = `
Load the full instructions of a custom skill. Call this BEFORE responding when the
user's request matches one of the skills listed in your system prompt. Follow the
returned instructions for your response.
`;

export function createActivateSkillTool(userId: string) {
  return tool({
    description,
    inputSchema: z.object({
      id: z.string().describe("The skill ID to activate"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      name: z.string().optional(),
      content: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ id }) => {
      const skill = await getSkillById(id, userId);
      if (!skill?.enabled) {
        return { success: false, error: "Skill not found or disabled." };
      }
      await touchSkillActivation(id, userId);
      return { success: true, name: skill.name, content: skill.content };
    },
  });
}
