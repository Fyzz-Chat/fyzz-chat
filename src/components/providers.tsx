import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { VersionChecker } from "@/components/version-checker";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { TranslationsProvider } from "@/lib/contexts/translations-context";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const translationsPromise = getTranslations();

  return (
    <TranslationsProvider translationsPromise={translationsPromise}>
      <TRPCReactProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <AuthProvider>
            <VersionChecker />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </TRPCReactProvider>
    </TranslationsProvider>
  );
}
