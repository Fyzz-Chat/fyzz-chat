import type { getDictionary } from "@/lib/backend/locale/dictionaries";

export type Locale = "en" | "hu";

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
