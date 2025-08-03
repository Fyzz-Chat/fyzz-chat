import { canonicalUrl, metaDescription, metaTitle, openGraph } from "@/lib/metadata";
import type { Metadata } from "next";

const path = "/v3";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: {
    canonical: `${canonicalUrl}${path}`,
  },
  openGraph: {
    ...openGraph,
    title: metaTitle,
    description: metaDescription,
    url: path,
  },
};

export default function Page() {
  return null;
}
