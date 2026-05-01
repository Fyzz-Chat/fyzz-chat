"use client";

import { Check, Copy, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCreateProjectSkill,
  useDeleteProjectSkill,
  useProjectSkills,
  useUpdateProjectSkill,
} from "@/lib/queries/skills";

interface ProjectSkillsProps {
  projectId: string;
}

const SKILL_SKELETON_KEYS = ["sk1", "sk2"];

export function ProjectSkills({ projectId }: ProjectSkillsProps) {
  const { data: skills = [], isPending } = useProjectSkills(projectId);
  const createMutation = useCreateProjectSkill(projectId);
  const updateMutation = useUpdateProjectSkill(projectId);
  const deleteMutation = useDeleteProjectSkill(projectId);

  const [dialogSkill, setDialogSkill] = useState<SkillItem | null | "new">(null);
  const [skillToDelete, setSkillToDelete] = useState<SkillItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleToggle(skill: SkillItem, enabled: boolean) {
    updateMutation.mutate(
      { id: skill.id, data: { enabled } },
      { onError: () => toast.error("Failed to update skill") }
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
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-sm">Skills</h3>
          <p className="text-muted-foreground text-xs">
            Reusable instructions the AI activates for this project.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setDialogSkill("new")}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {SKILL_SKELETON_KEYS.map((key) => (
            <div key={key} className="border-b py-2 last:border-b-0">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <p className="text-muted-foreground text-xs italic">
          No skills yet. Add one to shape how the AI responds in this project.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="group flex flex-col gap-1 border-b py-2 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate font-medium font-mono text-sm">
                  {skill.name}
                </code>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleCopy(skill)}
                          aria-label={`Copy ${skill.name} as SKILL.md`}
                        >
                          {copiedId === skill.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
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
                    className="size-7"
                    onClick={() => setDialogSkill(skill)}
                    aria-label={`Edit ${skill.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setSkillToDelete(skill)}
                    aria-label={`Delete ${skill.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Switch
                  checked={skill.enabled}
                  onCheckedChange={(v) => handleToggle(skill, v)}
                  aria-label={`Toggle ${skill.name}`}
                />
              </div>
              <p className="truncate text-muted-foreground text-xs">
                {skill.description}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatLastActivated(skill.lastActivatedAt)}
              </p>
            </li>
          ))}
        </ul>
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
