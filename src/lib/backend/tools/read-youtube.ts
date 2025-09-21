import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { tool } from "ai";
import { z } from "zod";

const toolDescription = `
This tool can read captions from YouTube videos by parsing them from the video page DOM.
Only works with videos that have captions available.
Use this tool when you need to analyze the content of a YouTube video.
`;

export const readYoutubeTool = tool({
  description: toolDescription,
  inputSchema: z.object({
    url: z.string().describe("The YouTube video URL to read captions from"),
  }),
  execute: async ({ url }) => {
    try {
      const loader = YoutubeLoader.createFromUrl(url);
      const docs = await loader.load();
      return docs[0].pageContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return `This video could not be parsed - ${errorMessage}`;
    }
  },
});
