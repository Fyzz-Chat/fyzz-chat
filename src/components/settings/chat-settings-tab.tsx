"use client";

import { LayoutSelector } from "@/components/settings/layout-selector";
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select your preferred chat layout
            </p>
            <LayoutSelector />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
