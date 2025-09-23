import { openai } from "@ai-sdk/openai";
import { generateText, hasToolCall, tool } from "ai";
import z from "zod";
import { logDuration } from "../utils";

export function codeInterpreterTool(modelId: string) {
  return tool({
    description:
      "This tool can be used to execute Python code in a sandboxed environment.",
    inputSchema: z.object({
      code: z.string().describe("The Python code to execute"),
    }),
    execute: async ({ code }) => {
      const start = performance.now();

      const result = await generateText({
        model: openai(modelId),
        prompt: `Execute the following Python code: ${code}`,
        tools: {
          code_interpreter: openai.tools.codeInterpreter(),
        },
        toolChoice: "required",
        stopWhen: [hasToolCall("code_interpreter")],
      });

      logDuration(start, "Code executed");

      return result.text;
    },
  });
}
