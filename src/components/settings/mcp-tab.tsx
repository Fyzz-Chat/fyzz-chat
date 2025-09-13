"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMcpServers } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { MissingKeyError } from "@/types/mcp";
import type { JsonValue } from "@prisma/client/runtime/library";
import { Plus, Trash2 } from "lucide-react";
import { use, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ServerItem = { name: string; url: string };

export function McpTab({ userMcpServers }: { userMcpServers?: JsonValue }) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { handleSubmit } = useForm();

  const initialServers = useMemo<ServerItem[]>(() => {
    try {
      if (!userMcpServers) return [];
      const parsed =
        typeof userMcpServers === "string" ? JSON.parse(userMcpServers) : userMcpServers;
      const entries = (parsed as any)?.mcpServers ?? {};
      return Object.keys(entries).map((key) => ({
        name: key,
        url: entries[key]?.url ?? "",
      }));
    } catch {
      return [];
    }
  }, [userMcpServers]);

  const [servers, setServers] = useState<ServerItem[]>(initialServers);

  function addServer() {
    setServers((prev) => [...prev, { name: "", url: "" }]);
  }

  function removeServer(index: number) {
    setServers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateServer(index: number, key: keyof ServerItem, value: string) {
    setServers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  async function onSubmit() {
    try {
      const valid = servers.filter((s) => s.name.trim() && s.url.trim());
      const payload = {
        mcpServers: valid.reduce<Record<string, { url: string }>>(
          (acc, { name, url }) => {
            acc[name.trim()] = { url: url.trim() };
            return acc;
          },
          {}
        ),
      };

      const json = JSON.stringify(payload);

      const response = await saveMcpServers(json);

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
          <div className="flex w-full flex-col gap-4">
            {servers.map((server, index) => (
              <div
                key={index}
                className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_minmax(0,2fr)_auto] sm:gap-3"
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`server-name-${index}`}>Name</Label>
                  <Input
                    id={`server-name-${index}`}
                    value={server.name}
                    onChange={(e) => updateServer(index, "name", e.target.value)}
                    placeholder="context7"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`server-url-${index}`}>URL</Label>
                  <Input
                    id={`server-url-${index}`}
                    type="url"
                    value={server.url}
                    onChange={(e) => updateServer(index, "url", e.target.value)}
                    placeholder="https://example.com/mcp"
                  />
                </div>
                <div className="flex items-end sm:pl-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeServer(index)}
                    aria-label="Remove server"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div>
              <Button type="button" variant="secondary" onClick={addServer}>
                <Plus className="mr-2 h-4 w-4" /> Add server
              </Button>
            </div>
          </div>
          <Button type="submit" className="px-5 self-end">
            {translations.settings.mcp.saveButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
