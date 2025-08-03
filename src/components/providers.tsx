import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { TranslationsProvider } from "@/lib/contexts/translations-context";
import { TRPCReactProvider } from "@/lib/trpc/client";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const translationsPromise = getTranslations();

  return (
    <TranslationsProvider translationsPromise={translationsPromise}>
      <TRPCReactProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </TranslationsProvider>
  );
}
