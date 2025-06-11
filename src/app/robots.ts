import conf from "@/lib/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/share/",
    },
    sitemap: `${conf.host}/sitemap.xml`,
  };
}
