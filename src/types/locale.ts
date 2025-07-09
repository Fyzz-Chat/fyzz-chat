import type { getTranslations } from "@/lib/backend/locale/dictionaries";

export type Locale = "en" | "de" | "hu";

export type Translations = Awaited<ReturnType<typeof getTranslations>>;
