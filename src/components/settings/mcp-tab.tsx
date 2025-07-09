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
import type { Translations } from "@/types/locale";
import { MissingKeyError } from "@/types/mcp";
import type { JsonValue } from "@prisma/client/runtime/library";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const placeholderServers = `{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}`;

export function McpTab({
  userMcpServers,
  translations,
}: { userMcpServers?: JsonValue; translations: Translations["settings"]["mcp"] }) {
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

      toast.success(translations.success.title, {
        description: translations.success.description,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error(translations.error.title, {
          description: translations.error.description,
        });
      } else if (error instanceof MissingKeyError) {
        toast.error(translations.missingKey.title, {
          description: translations.missingKey.description,
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{translations.title}</CardTitle>
        <CardDescription>{translations.description}</CardDescription>
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
            {translations.saveButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
