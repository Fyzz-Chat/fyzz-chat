export const XAI_RESPONSES_MODELS = [
  "grok-4.20-0309-reasoning",
  "grok-4.3",
  "grok-4.5",
  "grok-build-0.1",
] as const;

export const XAI_CHAT_MODELS = [] as const;

export const OPENAI_CODE_INTERPRETER_DENYLIST = [
  "gpt-5-codex",
  "gpt-5.1-codex",
  "gpt-5.2-codex",
  "gpt-5.3-codex",
  "o3-mini",
] as const;

export const OPENAI_IMAGE_GENERATION_MODELS = [
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-5.1",
  "gpt-5.2",
  "gpt-5.4-nano",
  "gpt-5.4-mini",
  "gpt-5.4",
  "gpt-5.5",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
] as const;

export const OPENAI_REASONING_MODELS = ["gpt-5-codex"] as const;

export const GEMINI_REASONING_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-3.5-flash",
] as const;

export const FIREWORKS_REASONING_MODELS = [
  "accounts/fireworks/models/deepseek-v4-pro",
  "accounts/fireworks/models/kimi-k2p5",
  "accounts/fireworks/models/kimi-k2p6",
  "accounts/fireworks/models/glm-5p1",
] as const;

export const FIREWORKS_NON_REASONING_MODELS = [] as const;

export const TOOLS_DISABLED_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-image",
  "sonar",
  "sonar-pro",
] as const;
