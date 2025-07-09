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
import type { Dictionary } from "@/types/locale";
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
  dict,
}: { userMcpServers?: JsonValue; dict: Dictionary["settings"]["mcp"] }) {
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

      toast.success(dict.success.title, {
        description: dict.success.description,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error(dict.error.title, {
          description: dict.error.description,
        });
      } else if (error instanceof MissingKeyError) {
        toast.error(dict.missingKey.title, {
          description: dict.missingKey.description,
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.title}</CardTitle>
        <CardDescription>{dict.description}</CardDescription>
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
            {dict.saveButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
