import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { tool } from "ai";
import { compile } from "html-to-text";
import { z } from "zod";

const toolDescription = `
This tool can read the content of a URL and return it as text.
Use this tool when you need to fetch and analyze content from web pages.
`;

const compiledConvert = compile({ wordwrap: null });

export const readUrlTool = tool({
  description: toolDescription,
  inputSchema: z.object({
    url: z.url().describe("The URL to read content from"),
  }),
  execute: async ({ url }) => {
    try {
      const loader = new RecursiveUrlLoader(url, {
        extractor: compiledConvert,
        maxDepth: 1,
      });

      const docs = await loader.load();
      const content = docs[0].pageContent;

      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to read URL: ${errorMessage}`);
    }
  },
});
