import { tool } from "ai";
import * as cheerio from "cheerio";
import { z } from "zod";

const toolDescription = `
This tool can read the content of a URL and return it as text.
Use this tool when you need to fetch and analyze content from web pages.
`;

export const readUrlTool = tool({
  description: toolDescription,
  inputSchema: z.object({
    url: z.url().describe("The URL to read content from"),
  }),
  execute: async ({ url }) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      $("script").remove();
      $("style").remove();
      const content = $("body").text().trim();

      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to read URL: ${errorMessage}`);
    }
  },
});
