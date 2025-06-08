"use client";

import { LayoutSelector } from "@/components/settings/layout-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function DisplaySettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Settings</CardTitle>
        <CardDescription>
          Choose how you want to display your chat interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">Layout Style</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Select your preferred chat layout
            </p>
            <LayoutSelector />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">Theme</h3>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Choose your preferred color theme
            </p>
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
