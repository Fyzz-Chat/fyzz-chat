"use client";

import { Check, Copy, LightbulbIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  buildSkillMarkdown,
  formatLastActivated,
  SkillDialog,
  type SkillItem,
} from "@/components/skills/skill-dialog";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateSkill,
  useDeleteSkill,
  useSkills,
  useUpdateSkill,
  useUpdateSkillsEnabled,
} from "@/lib/queries/skills";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  async function handleCopy(skill: SkillItem) {
    try {
      await navigator.clipboard.writeText(buildSkillMarkdown(skill));
      setCopiedId(skill.id);
      setTimeout(() => {
        setCopiedId((current) => (current === skill.id ? null : current));
      }, 1500);
    } catch {
      toast.error("Failed to copy skill");
    }
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(skill)}
                        aria-label={`Copy ${skill.name} as SKILL.md`}
                      >
                        {copiedId === skill.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copiedId === skill.id ? "Copied!" : "Copy as SKILL.md"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
