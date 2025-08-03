"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveMcpServers } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { MissingKeyError } from "@/types/mcp";
import type { JsonValue } from "@prisma/client/runtime/library";
import { use } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const placeholderServers = `{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}`;

export function McpTab({ userMcpServers }: { userMcpServers?: JsonValue }) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { register, handleSubmit } = useForm<{ mcpServers: string }>({
    defaultValues: {
      mcpServers: userMcpServers ? (userMcpServers as string) : "",
    },
  });

  async function onSubmit(data: { mcpServers: string }) {
    try {
      if (data.mcpServers !== "") {
        const parsed = JSON.parse(data.mcpServers);
        if (!parsed.mcpServers) {
          throw new MissingKeyError("mcpServers");
        }
      }

      const response = await saveMcpServers(data.mcpServers);

      if (response === "missing_key") {
        throw new MissingKeyError("mcpServers");
      } else if (response === "invalid_json") {
        throw new SyntaxError("Invalid JSON");
      }

      toast.success(translations.settings.mcp.success.title, {
        description: translations.settings.mcp.success.description,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error(translations.settings.mcp.error.title, {
          description: translations.settings.mcp.error.description,
        });
      } else if (error instanceof MissingKeyError) {
        toast.error(translations.settings.mcp.missingKey.title, {
          description: translations.settings.mcp.missingKey.description,
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.settings.mcp.title}</CardTitle>
        <CardDescription>{translations.settings.mcp.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full items-start"
        >
          <Textarea
            {...register("mcpServers")}
            rows={10}
            placeholder={placeholderServers}
          />
          <Button type="submit" className="px-5 self-end">
            {translations.settings.mcp.saveButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
