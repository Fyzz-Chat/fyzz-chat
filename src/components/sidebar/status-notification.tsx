"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/lib/trpc/client";

export default function StatusNotification() {
  const trpc = useTRPC();
  const { data: status } = useQuery(
    trpc.status.queryOptions(undefined, { refetchOnMount: true })
  );

  if (!status) return null;

  return (
    !status.all && (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle>Warning</CardTitle>
          <CardDescription>Some services are down.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {!status.providers.openai && (
              <Badge variant="destructive" className="flex justify-center">
                OpenAI
              </Badge>
            )}
            {!status.providers.anthropic && (
              <Badge variant="destructive" className="flex justify-center">
                Anthropic
              </Badge>
            )}
            {!status.providers.perplexity && (
              <Badge variant="destructive" className="flex justify-center">
                Perplexity
              </Badge>
            )}
            {!status.providers.fireworks && (
              <Badge variant="destructive" className="flex justify-center">
                Fireworks
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  );
}
