import { Brain, CodeXml, FileText, Globe, Image } from "lucide-react";
import Anthropic from "@/components/icons/anthropic";
import DeepSeek from "@/components/icons/deepseek";
import Google from "@/components/icons/google";
import Meta from "@/components/icons/meta";
import OpenAI from "@/components/icons/openai";
import Perplexity from "@/components/icons/perplexity";
import Qwen from "@/components/icons/qwen";
import XAI from "@/components/icons/xai";
import type { PublicProvider } from "@/types/provider";

export const featureIcons = {
  brain: Brain,
  codeXml: CodeXml,
  fileText: FileText,
  globe: Globe,
  image: Image,
};

export const providerIcons = {
  openai: OpenAI,
  anthropic: Anthropic,
  google: Google,
  xai: XAI,
  meta: Meta,
  deepseek: DeepSeek,
  perplexity: Perplexity,
  qwen: Qwen,
};

export function getProviderIcon(providers: PublicProvider[], modelId: string | null) {
  if (!modelId) return "openai";

  const provider = providers.find((p) => p.models.some((m) => m.id === modelId));
  return provider?.icon;
}
