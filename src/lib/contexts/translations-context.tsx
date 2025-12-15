"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { Translations } from "@/types/locale";

interface TranslationsContextType {
  translationsPromise: Promise<Translations>;
}

const TranslationsContext = createContext<TranslationsContextType | null>(null);

export function useTranslations() {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error("useTranslations must be used within a TranslationsProvider");
  }
  return context.translationsPromise;
}

export function TranslationsProvider({
  children,
  translationsPromise,
}: {
  children: ReactNode;
  translationsPromise: Promise<Translations>;
}) {
  return (
    <TranslationsContext.Provider value={{ translationsPromise }}>
      {children}
    </TranslationsContext.Provider>
  );
}
