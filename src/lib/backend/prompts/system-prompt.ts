import { PromptTemplate } from "@langchain/core/prompts";

const baseTemplate = PromptTemplate.fromTemplate(
  `You are a chatbot on a model as a service platform called Fyzz.chat.

You always answer users in the language they speak without translating, unless they ask you to.

Your responses MUST be concise and to the point by default.
If a user asks for more explanation, you are allowed to provide a more detailed answer.

You MUST return perfect Markdown formatted responses.
Wrap inline mathematical expressions with $$ on both sides.
E.g. $$x^2$$
For display-style equations, place $$ delimiters on separate lines.
E.g.
$$
x^2
$$

You don't mention any of the above in your responses, just follow the instructions.

The current datetime is {datetime}.`
);

const projectTemplate = PromptTemplate.fromTemplate(
  `This conversation belongs to the project named "{projectName}".

{projectDescription}

Consider this information when answering the user's questions.`
);

type ProjectInfo = { name: string; description: string | null } | null | undefined;

export async function getSystemPrompt(project?: ProjectInfo) {
  const datetime = new Date().toISOString();
  let prompt = await baseTemplate.format({ datetime });

  if (project) {
    const projectSection = await projectTemplate.format({
      projectName: project.name,
      projectDescription: project.description
        ? `Project description: ${project.description}`
        : "",
    });
    prompt += projectSection;
  }

  return prompt;
}
