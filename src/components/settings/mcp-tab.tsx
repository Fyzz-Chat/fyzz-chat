"use client";

import type { JsonValue } from "@prisma/client/runtime/client";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { use, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { saveMcpServers } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { MissingKeyError } from "@/types/mcp";

type ServerItem = { name: string; url: string; enabled: boolean; authorization: string };

export function McpTab({ userMcpServers }: Readonly<{ userMcpServers?: JsonValue }>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { handleSubmit } = useForm();

  const initialServers = useMemo<ServerItem[]>(() => {
    try {
      if (!userMcpServers) return [];
      const parsed =
        typeof userMcpServers === "string" ? JSON.parse(userMcpServers) : userMcpServers;
      const entries = parsed?.mcpServers ?? {};
      return Object.keys(entries).map((key) => ({
        name: key,
        url: entries[key]?.url ?? "",
        enabled: entries[key]?.enabled !== false,
        authorization: entries[key]?.authorization ?? "",
      }));
    } catch {
      return [];
    }
  }, [userMcpServers]);

  const [servers, setServers] = useState<ServerItem[]>(initialServers);
  const [visibleAuth, setVisibleAuth] = useState<Record<number, boolean>>({});

  function addServer() {
    setServers((prev) => [
      ...prev,
      { name: "", url: "", enabled: true, authorization: "" },
    ]);
  }

  function removeServer(index: number) {
    setServers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateServer(index: number, key: keyof ServerItem, value: string | boolean) {
    setServers((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  }

  async function onSubmit() {
    try {
      const valid = servers.filter((s) => s.name.trim() && s.url.trim());
      const payload = {
        mcpServers: valid.reduce<
          Record<string, { url: string; enabled?: boolean; authorization?: string }>
        >((acc, { name, url, enabled, authorization }) => {
          acc[name.trim()] = {
            url: url.trim(),
            ...(enabled === false ? { enabled } : {}),
            ...(authorization.trim() ? { authorization: authorization.trim() } : {}),
          };
          return acc;
        }, {}),
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
          className="flex w-full flex-col items-start gap-4"
        >
          <div className="flex w-full flex-col gap-4">
            {servers.map((server, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: form field array; index is the row identity used by updateServer/removeServer
              <div key={index} className="flex w-full flex-col gap-2">
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_minmax(0,2fr)_auto_auto] sm:gap-3">
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
                  <div className="flex items-end gap-2">
                    <div className="flex h-full flex-col gap-1">
                      <Label htmlFor={`server-enabled-${index}`}>Enabled</Label>
                      <div className="flex flex-1 items-center justify-center">
                        <Switch
                          id={`server-enabled-${index}`}
                          checked={server.enabled}
                          onCheckedChange={(checked) =>
                            updateServer(index, "enabled", checked)
                          }
                        />
                      </div>
                    </div>
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
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`server-auth-${index}`}>Authorization</Label>
                  <div className="relative">
                    <Input
                      id={`server-auth-${index}`}
                      type={visibleAuth[index] ? "text" : "password"}
                      value={server.authorization}
                      onChange={(e) =>
                        updateServer(index, "authorization", e.target.value)
                      }
                      placeholder="Bearer sk-..."
                      className="pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setVisibleAuth((prev) => ({ ...prev, [index]: !prev[index] }))
                      }
                      aria-label={
                        visibleAuth[index] ? "Hide authorization" : "Show authorization"
                      }
                    >
                      {visibleAuth[index] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Sent as the Authorization header. Leave empty if the server does not
                    require authentication.
                  </p>
                </div>
              </div>
            ))}

            <div>
              <Button type="button" variant="secondary" onClick={addServer}>
                <Plus className="mr-2 h-4 w-4" /> Add server
              </Button>
            </div>
          </div>
          <Button type="submit" className="self-end px-5">
            {translations.settings.mcp.saveButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
