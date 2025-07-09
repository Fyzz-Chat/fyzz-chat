"use client";

import { LayoutSelector } from "@/components/settings/layout-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Translations } from "@/types/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function DisplaySettingsTab({
  translations,
}: { translations: Translations["settings"]["display"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <CardDescription>{translations.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">{translations.layout.title}</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {translations.layout.description}
            </p>
            <LayoutSelector translations={translations.layout} />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">{translations.theme.title}</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {translations.theme.description}
            </p>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
