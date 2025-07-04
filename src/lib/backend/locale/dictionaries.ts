import "server-only";

import type { Locale } from "@/types/locale";
import { cookies } from "next/headers";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  de: () => import("./dictionaries/de.json").then((module) => module.default),
  hu: () => import("./dictionaries/hu.json").then((module) => module.default),
};

export const getDictionary = async () => {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("locale")?.value as Locale) || "en";

  return dictionaries[lang]();
};
