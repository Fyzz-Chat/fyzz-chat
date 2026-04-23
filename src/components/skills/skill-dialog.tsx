"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type SkillItem = {
  id: string;
  name: string;
  description: string;
  content: string;
  enabled: boolean;
  lastActivatedAt: Date | null;
  userId: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SkillActionResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: "duplicate_name" | "invalid_name" | "server"; message: string };

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function formatLastActivated(date: Date | null): string {
  if (!date) return "Never used";
  return `Last used ${new Date(date).toLocaleDateString()}`;
}

export function buildSkillMarkdown(skill: {
  name: string;
  description: string;
  content: string;
}): string {
  return `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n${skill.content}\n`;
}

type ParsedSkillPaste = {
  name?: string;
  description?: string;
  content: string;
};

function parseSkillPaste(raw: string): ParsedSkillPaste | null {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return null;
  const [, yamlBlock, body] = match;

  const fields: Record<string, string> = {};
  for (const line of yamlBlock.split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line
      .slice(colon + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) fields[key] = value;
  }

  return {
    name: fields.name,
    description: fields.description,
    content: body.trim(),
  };
}

export function SkillDialog({
  skill,
  onClose,
  onSave,
}: Readonly<{
  skill: SkillItem | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    content: string;
  }) => Promise<SkillActionResult>;
}>) {
  const [name, setName] = useState(skill?.name ?? "");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [content, setContent] = useState(skill?.content ?? "");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  function handleFrontmatterPaste(event: React.ClipboardEvent) {
    const pasted = event.clipboardData.getData("text");
    const parsed = parseSkillPaste(pasted);
    if (!parsed) return;
    event.preventDefault();
    const filled: string[] = [];
    if (parsed.name) {
      setName(parsed.name);
      filled.push("name");
    }
    if (parsed.description) {
      setDescription(parsed.description);
      filled.push("description");
    }
    setContent(parsed.content);
    filled.push("instructions");
    setPasteNotice(`Parsed frontmatter: populated ${filled.join(", ")}.`);
  }

  const trimmedName = name.trim();
  const nameInvalid = trimmedName.length > 0 && !KEBAB_CASE_RE.test(trimmedName);
  const canSave =
    trimmedName.length > 0 &&
    !nameInvalid &&
    description.trim().length > 0 &&
    content.trim().length > 0 &&
    !isPending;

  async function handleSubmit() {
    if (!canSave) return;
    setIsPending(true);
    setServerError(null);
    try {
      const result = await onSave({
        name: trimmedName,
        description: description.trim(),
        content,
      });
      if (result.ok) {
        onClose();
      } else {
        setServerError(result.message);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{skill ? "Edit skill" : "New skill"}</DialogTitle>
          <DialogDescription>
            Define a reusable instruction set the AI will activate when your request
            matches the description. You can also paste a full SKILL.md (YAML frontmatter
            + body) into any field and we'll split it across the inputs.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="skill-name">Name</Label>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onPaste={handleFrontmatterPaste}
              placeholder="code-reviewer"
              autoFocus
              className="font-mono"
            />
            {nameInvalid && (
              <p className="text-destructive text-xs">
                Name must be kebab-case (lowercase letters/digits separated by single
                hyphens).
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="skill-description">Description</Label>
            <Input
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onPaste={handleFrontmatterPaste}
              placeholder="Use when the user asks to review code."
            />
            <p className="text-muted-foreground text-xs">
              Tells the AI when to activate this skill. Keep it short.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="skill-content">Instructions</Label>
            <Textarea
              id="skill-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handleFrontmatterPaste}
              rows={8}
              className="resize-none font-mono text-sm"
              placeholder="The full instructions the AI should follow when this skill is activated."
            />
            <p className="text-muted-foreground text-xs">
              Skills are standalone — external file or script references (e.g.{" "}
              <code>./tools/x.ts</code>) aren't fetched or executed.
            </p>
          </div>
          {pasteNotice && <p className="text-muted-foreground text-xs">{pasteNotice}</p>}
          {serverError && <p className="text-destructive text-sm">{serverError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
