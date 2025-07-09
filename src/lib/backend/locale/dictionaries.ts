import "server-only";

import type { Locale } from "@/types/locale";
import { cookies } from "next/headers";

export const locales: Locale[] = ["en", "de", "hu"];

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  de: () => import("./dictionaries/de.json").then((module) => module.default),
  hu: () => import("./dictionaries/hu.json").then((module) => module.default),
};

export const getTranslations = async () => {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("locale")?.value as Locale) || "en";

  return dictionaries[lang]();
};
