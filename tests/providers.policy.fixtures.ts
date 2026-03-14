export const XAI_RESPONSES_MODELS = [
  "grok-4-fast-non-reasoning",
  "grok-4-1-fast-non-reasoning",
] as const;

export const XAI_CHAT_MODELS = ["grok-3", "grok-code-fast-1"] as const;

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
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-5",
  "gpt-5.1",
  "gpt-5.2",
  "gpt-5.4",
] as const;

export const OPENAI_REASONING_MODELS = ["gpt-5", "gpt-5-codex"] as const;

export const FIREWORKS_REASONING_MODELS = [
  "accounts/fireworks/models/deepseek-v3p2",
  "accounts/fireworks/models/kimi-k2p5",
  "accounts/fireworks/models/glm-5",
] as const;

export const FIREWORKS_NON_REASONING_MODELS = [
  "accounts/fireworks/models/deepseek-v3p1",
] as const;

export const TOOLS_DISABLED_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-image",
  "gemma-3-27b-it",
  "sonar",
  "sonar-pro",
] as const;

export const XAI_SEARCH_TOOLS_MODELS = XAI_RESPONSES_MODELS;
