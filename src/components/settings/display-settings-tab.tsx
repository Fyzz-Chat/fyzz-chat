"use client";

import { use } from "react";
import { LayoutSelector } from "@/components/settings/layout-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from "@/lib/contexts/translations-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function DisplaySettingsTab() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.settings.display.title}</CardTitle>
        <CardDescription>{translations.settings.display.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="font-medium text-sm">
            {translations.settings.display.layout.title}
          </h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {translations.settings.display.layout.description}
            </p>
            <LayoutSelector />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="font-medium text-sm">
            {translations.settings.display.theme.title}
          </h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {translations.settings.display.theme.description}
            </p>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
