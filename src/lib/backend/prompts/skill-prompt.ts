import { getUserSkills } from "@/lib/dao/skills";

export async function getSkillPrompt(userId: string): Promise<string> {
  const skills = await getUserSkills(userId);
  if (skills.length === 0) return "";

  const formatted = skills
    .map((s) => `- ${s.name} [id: ${s.id}]: ${s.description}`)
    .join("\n");

  return (
    `\n\nYou have the following custom skills. When a user's request matches a skill, ` +
    `call the activate_skill tool with the skill's ID to load its full instructions ` +
    `BEFORE you start responding. Do not guess what the skill contains.\n\n` +
    `${formatted}`
  );
}
