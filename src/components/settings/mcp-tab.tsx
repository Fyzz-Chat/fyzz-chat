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

export function McpTab({ userMcpServers }: { userMcpServers?: JsonValue }) {
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

      toast.success("MCP servers updated", {
        description: "Your MCP servers have been updated.",
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON", {
          description: "Please provide a valid JSON object.",
        });
      } else if (error instanceof MissingKeyError) {
        toast.error("Missing mcpServers key", {
          description: "Please provide a JSON with an mcpServers key.",
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP Servers</CardTitle>
        <CardDescription>
          Add MCP servers to your account. Only HTTP and SSE servers are supported at the
          moment.
        </CardDescription>
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
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
