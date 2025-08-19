import { generatePresignedUploadUrl, getFileUrlSigned } from "@/lib/aws/s3";
import { logDuration } from "@/lib/backend/utils";
import { getUserIdFromSession } from "@/lib/dao/users";
import { logger } from "@/lib/logger";
import { openai } from "@ai-sdk/openai";
import { type Tool, experimental_generateImage, tool } from "ai";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const USE_OPENAI_IMAGE_GENERATION = false;

export async function generateImageTool(conversationId: string): Promise<Tool> {
  const userId = await getUserIdFromSession();

  return tool({
    description: "Generate an image based on a prompt",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate the image from"),
    }),
    execute: async ({ prompt }) => {
      const start = performance.now();

      let imageBase64: string;
      let mediaType = "image/png";

      if (USE_OPENAI_IMAGE_GENERATION) {
        const client = new OpenAI();
        const imageResponse = await client.responses.create({
          model: "gpt-5-mini",
          input: prompt,
          tools: [
            {
              type: "image_generation",
              quality: "medium",
            },
          ],
          // previous_response_id: previousResponseId,
        });

        logger.debug(`Image response ID: [${imageResponse.id}]`);

        const imageData = imageResponse.output
          .filter((output) => output.type === "image_generation_call")
          .map((output) => (output as any).result);

        imageBase64 = imageData[0];
      } else {
        const { image } = await experimental_generateImage({
          model: openai.image("gpt-image-1"),
          prompt,
          providerOptions: {
            openai: {
              quality: "medium",
            },
          },
        });

        imageBase64 = image.base64;
        mediaType = image.mediaType;
      }

      const key = `${userId}/${conversationId}/${uuidv4()}`;
      const url = await generatePresignedUploadUrl(key);
      const buffer = Buffer.from(imageBase64, "base64");

      const response = await fetch(url, {
        method: "PUT",
        body: buffer,
        headers: {
          "Content-Type": mediaType,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload generated image");
      }

      logger.debug("Generated image uploaded successfully");

      const signedUrl = getFileUrlSigned(key);

      logDuration(start, "Image generated");

      return { image: signedUrl, url: key, name: prompt, contentType: mediaType };
    },
  });
}
