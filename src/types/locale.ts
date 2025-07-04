import type { getDictionary } from "@/lib/backend/locale/dictionaries";

export type Locale = "en" | "de" | "hu";

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
