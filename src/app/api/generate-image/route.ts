import { appendMessageToConversation } from "@/lib/dao/conversations";
import { uploadAttachments } from "@/lib/dao/messages";
import { getUserFromSession } from "@/lib/dao/users";
import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import type { NextRequest } from "next/server";

export const maxDuration = 55;

export async function POST(req: NextRequest) {
  const user = await getUserFromSession();

  if (!process.env.OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  try {
    const { prompt, conversationId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response("Invalid prompt", { status: 400 });
    }

    if (!conversationId || typeof conversationId !== "string") {
      return new Response("Invalid conversation ID", { status: 400 });
    }

    // Generate image using AI SDK with gpt-image-1 model
    const { image } = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt,
      size: "1024x1024",
    }); // Create attachment for upload
    const imageAttachment = {
      name: `generated-image-${Date.now()}.png`,
      contentType: "image/png",
      url: `data:image/png;base64,${image.base64}`,
    };

    // Upload the image and get the attachment
    const attachments = await uploadAttachments(
      [imageAttachment],
      user.id,
      conversationId
    );

    const userMessage: any = {
      role: "user",
      content: prompt,
    };

    const assistantMessage: any = {
      role: "assistant",
      content: "Here is your generated image:",
      files: attachments,
    };

    await appendMessageToConversation(userMessage, conversationId);
    await appendMessageToConversation(assistantMessage, conversationId);

    return Response.json({
      image: imageAttachment.url,
      prompt: prompt,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
