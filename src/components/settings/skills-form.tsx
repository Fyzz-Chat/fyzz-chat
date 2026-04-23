"use client";

import { LightbulbIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSkill,
  useDeleteSkill,
  useSkills,
  useUpdateSkill,
  useUpdateSkillsEnabled,
} from "@/lib/queries/skills";

type SkillItem = {
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

const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function formatLastActivated(date: Date | null): string {
  if (!date) return "Never used";
  return `Last used ${new Date(date).toLocaleDateString()}`;
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

export default function SkillsForm({
  initialSkills,
  initialSkillsEnabled,
}: Readonly<{
  initialSkills: SkillItem[];
  initialSkillsEnabled: boolean;
}>) {
  const { data: skills = [] } = useSkills(initialSkills);
  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();
  const toggleSkillsEnabled = useUpdateSkillsEnabled();

  const [skillsEnabled, setSkillsEnabled] = useState(initialSkillsEnabled);
  const [dialogSkill, setDialogSkill] = useState<SkillItem | null | "new">(null);
  const [skillToDelete, setSkillToDelete] = useState<SkillItem | null>(null);

  function handleToggleFeature(enabled: boolean) {
    setSkillsEnabled(enabled);
    toggleSkillsEnabled.mutate(enabled, {
      onError: () => {
        setSkillsEnabled(!enabled);
        toast.error("Failed to update skills setting");
      },
    });
  }

  function handleToggleSkill(skill: SkillItem, enabled: boolean) {
    updateMutation.mutate(
      { id: skill.id, data: { enabled } },
      {
        onError: () => toast.error("Failed to update skill"),
      }
    );
  }

  function handleDeleteConfirmed() {
    if (!skillToDelete) return;
    const id = skillToDelete.id;
    setSkillToDelete(null);
    deleteMutation.mutate(id, {
      onSuccess: (result) => {
        if (!result.ok) toast.error(result.message);
      },
      onError: () => toast.error("Failed to delete skill"),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="skills-enabled"
            checked={skillsEnabled}
            onCheckedChange={handleToggleFeature}
          />
          <Label htmlFor="skills-enabled">Enable skills</Label>
        </div>
        <Button size="sm" onClick={() => setDialogSkill("new")} disabled={!skillsEnabled}>
          <Plus className="mr-2 h-4 w-4" /> Add skill
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Skills are reusable instructions the AI activates when your request matches the
        skill's description. Names must be kebab-case (e.g. <code>code-reviewer</code>).
      </p>

      {skills.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
          <LightbulbIcon className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No skills yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-start justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <code className="truncate font-medium font-mono text-sm">
                    {skill.name}
                  </code>
                  {!skill.enabled && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                      disabled
                    </span>
                  )}
                </div>
                <p className="truncate text-muted-foreground text-sm">
                  {skill.description}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatLastActivated(skill.lastActivatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  checked={skill.enabled}
                  onCheckedChange={(v) => handleToggleSkill(skill, v)}
                  aria-label={`Toggle ${skill.name}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialogSkill(skill)}
                  aria-label={`Edit ${skill.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSkillToDelete(skill)}
                  aria-label={`Delete ${skill.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dialogSkill !== null && (
        <SkillDialog
          skill={dialogSkill === "new" ? null : dialogSkill}
          onClose={() => setDialogSkill(null)}
          onSave={async (data) => {
            if (dialogSkill === "new") {
              const result = await createMutation.mutateAsync(data);
              if (!result.ok) return result;
              toast.success(`Skill "${data.name}" created`);
              return result;
            }
            const result = await updateMutation.mutateAsync({
              id: dialogSkill.id,
              data,
            });
            if (!result.ok) return result;
            toast.success(`Skill "${data.name}" updated`);
            return result;
          }}
        />
      )}

      <AlertDialog
        open={skillToDelete !== null}
        onOpenChange={(open) => !open && setSkillToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete skill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <code className="font-mono">{skillToDelete?.name}</code>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type SkillActionResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: "duplicate_name" | "invalid_name" | "server"; message: string };

function SkillDialog({
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
