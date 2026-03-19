"use client";

import { Check, Copy, Key, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/lib/queries/api-keys";

type ApiKeyInfo = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
};

export function ApiKeysTab({ initialKeys }: Readonly<{ initialKeys: ApiKeyInfo[] }>) {
  const { data: keys = [] } = useApiKeys(initialKeys);
  const createMutation = useCreateApiKey();
  const deleteMutation = useDeleteApiKey();

  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate() {
    const name = newKeyName.trim();
    if (!name) return;

    createMutation.mutate(name, {
      onSuccess: (result) => {
        setRevealedKey(result.rawKey);
        setNewKeyName("");
        toast.success("API key created");
      },
      onError: () => toast.error("Failed to create API key"),
    });
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onError: () => toast.error("Failed to delete API key"),
    });
  }

  async function handleCopy() {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPending = createMutation.isPending || deleteMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Create API keys for programmatic access to your conversations.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {revealedKey && (
          <div className="flex flex-col gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="font-medium text-sm">
              Copy your API key now. It won't be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                {revealedKey}
              </code>
              <Button type="button" variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. PAI)"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={isPending || !newKeyName.trim()}>
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
        </div>

        {keys.length > 0 && (
          <div className="flex flex-col gap-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{key.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {key.prefix}...{" "}
                      {key.lastUsedAt
                        ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(key.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
