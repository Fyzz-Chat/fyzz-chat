import type { Metadata } from "next";

export const metaTitle = "Fyzz.chat - Chat with the best AI models, all in one place";
export const metaDescription =
  "One platform for GPT, Perplexity, Gemini, and more. Chat, speak with PDFs, and analyze images.";
export const canonicalUrl = "https://www.fyzz.chat";

export const openGraph: Metadata["openGraph"] = {
  title: metaTitle,
  description: metaDescription,
  type: "website",
  siteName: "Fyzz.chat",
  locale: "en_US",
  images: [
    {
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
    },
  ],
};

export const twitter: Metadata["twitter"] = {
  title: metaTitle,
  description: metaDescription,
  card: "summary_large_image",
  images: [
    {
      url: "/twitter-image.png",
      width: 1200,
      height: 630,
    },
  ],
};
