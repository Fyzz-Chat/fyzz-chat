export const XAI_RESPONSES_MODELS = [
  "grok-4.20-0309-reasoning",
  "grok-4.3",
  "grok-4.5",
  "grok-build-0.1",
  "grok-4.6",
  "grok-4.7",
] as const;

export const XAI_CHAT_MODELS = [] as const;

export const OPENAI_CODE_INTERPRETER_DENYLIST = [] as const;

export const OPENAI_IMAGE_GENERATION_MODELS = [
  "gpt-5.2",
  "gpt-5.4-mini",
  "gpt-5.4",
  "gpt-5.5",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
  "gpt-6-luna",
  "gpt-6-sol",
  "gpt-6.1-sol",
  "gpt-6-astra",
  "gpt-6.1-terra",
] as const;

export const OPENAI_REASONING_MODELS = ["gpt-5.4-mini"] as const;

export const GEMINI_REASONING_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-4-hydrogen",
  "gemini-4-argon",
  "gemini-4-carbon",
] as const;

export const FIREWORKS_REASONING_MODELS = [
  "accounts/fireworks/models/deepseek-v4p1-flash",
  "accounts/fireworks/models/kimi-k3",
  "accounts/fireworks/models/glm-5p3",
  "accounts/fireworks/models/kimi-k3p1-pro",
] as const;

export const FIREWORKS_NON_REASONING_MODELS = [
  "accounts/fireworks/models/qwen3p8-max",
  "accounts/fireworks/models/minimax-m3",
] as const;

export const TOOLS_DISABLED_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-lite-image",
  "gemini-nano-banana-2.1",
  "gemini-3-pro-image",
  "sonar",
  "sonar-pro",
] as const;
