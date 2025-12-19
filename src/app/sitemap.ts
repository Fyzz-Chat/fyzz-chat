import type { MetadataRoute } from "next";
import conf from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${conf.host}/chat`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${conf.host}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${conf.host}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${conf.host}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${conf.host}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];
}
