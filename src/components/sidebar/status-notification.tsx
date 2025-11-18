"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStatus } from "@/lib/hooks/use-status";

export default function StatusNotification() {
  const status = useStatus();

  return (
    !status.all && (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle>Warning</CardTitle>
          <CardDescription>Some services are down.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {!status.openai && (
              <Badge variant="destructive" className="flex justify-center">
                OpenAI
              </Badge>
            )}
            {!status.claude && (
              <Badge variant="destructive" className="flex justify-center">
                Claude
              </Badge>
            )}
            {!status.perplexity && (
              <Badge variant="destructive" className="flex justify-center">
                Perplexity
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  );
}
