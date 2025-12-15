import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { VersionChecker } from "@/components/version-checker";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { TranslationsProvider } from "@/lib/contexts/translations-context";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers({ children }: { children: ReactNode }) {
  const translationsPromise = getTranslations();

  return (
    <TranslationsProvider translationsPromise={translationsPromise}>
      <TRPCReactProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <VersionChecker />
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </TranslationsProvider>
  );
}
