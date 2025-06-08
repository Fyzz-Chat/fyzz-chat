import type { PublicProvider } from "@/types/provider";
import { Brain, CodeXml, FileText, Globe, Image } from "lucide-react";
import dynamic from "next/dynamic";

const LazyAnthropic = dynamic(() => import("@/components/icons/anthropic"));
const LazyDeepSeek = dynamic(() => import("@/components/icons/deepseek"));
const LazyGoogle = dynamic(() => import("@/components/icons/google"));
const LazyXAI = dynamic(() => import("@/components/icons/xai"));
const LazyMeta = dynamic(() => import("@/components/icons/meta"));
const LazyOpenAI = dynamic(() => import("@/components/icons/openai"));
const LazyPerplexity = dynamic(() => import("@/components/icons/perplexity"));

export const featureIcons = {
  brain: Brain,
  codeXml: CodeXml,
  fileText: FileText,
  globe: Globe,
  image: Image,
};

export const providerIcons = {
  openai: LazyOpenAI,
  anthropic: LazyAnthropic,
  google: LazyGoogle,
  xai: LazyXAI,
  meta: LazyMeta,
  deepseek: LazyDeepSeek,
  perplexity: LazyPerplexity,
};

export function getProviderIcon(providers: PublicProvider[], modelId: string) {
  const provider = providers.find((p) => p.models.some((m) => m.id === modelId));
  return provider?.icon;
}
