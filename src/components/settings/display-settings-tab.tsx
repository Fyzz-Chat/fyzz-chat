"use client";

import { LayoutSelector } from "@/components/settings/layout-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Dictionary } from "@/types/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function DisplaySettingsTab({
  dict,
}: { dict: Dictionary["settings"]["display"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.title}</CardTitle>
        <CardDescription>{dict.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">{dict.layout.title}</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{dict.layout.description}</p>
            <LayoutSelector dict={dict.layout} />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">{dict.theme.title}</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{dict.theme.description}</p>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
