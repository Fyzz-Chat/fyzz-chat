import { generatePresignedUploadUrl, getFileUrlSigned } from "@/lib/aws/s3";
import { logDuration } from "@/lib/backend/utils";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { openai } from "@ai-sdk/openai";
import { type Tool, experimental_generateImage, tool } from "ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function generateImageTool(conversationId: string): Promise<Tool> {
  const userId = await getUserIdFromSession();

  return tool({
    description: "Generate an image based on a prompt",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate the image from"),
    }),
    execute: async ({ prompt }) => {
      const start = performance.now();

      const { image } = await experimental_generateImage({
        model: openai.image("gpt-image-1"),
        prompt,
        providerOptions: {
          openai: {
            quality: "medium",
          },
        },
      });

      const key = `${userId}/${conversationId}/${uuidv4()}`;
      const url = await generatePresignedUploadUrl(key);
      const buffer = Buffer.from(image.base64, "base64");

      const response = await fetch(url, {
        method: "PUT",
        body: buffer,
        headers: {
          "Content-Type": image.mediaType,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload generated image");
      }

      logger.debug("Generated image uploaded successfully");

      const signedUrl = getFileUrlSigned(key);

      logDuration(start, "Image generated");

      return { image: signedUrl, url: key, name: prompt, contentType: image.mediaType };
    },
  });
}
