"use client";

import {
  Folder,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
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
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLongPress } from "@/hooks/use-long-press";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useDeleteProject, useProjects, useUpdateProject } from "@/lib/queries/projects";
import { cn, formatTimeAgo } from "@/lib/utils";
import type { ProjectWithCount } from "@/types/chat";

interface ProjectsListPageProps {
  initialProjects: ProjectWithCount[];
}

type ProjectOverlayState = {
  mode: "actions" | "edit" | "delete";
  project: ProjectWithCount;
};

export function ProjectsListPage({ initialProjects }: Readonly<ProjectsListPageProps>) {
  const { data: projectsData } = useProjects({ projects: initialProjects });
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [projectOverlay, setProjectOverlay] = useState<ProjectOverlayState | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const projects = projectsData?.projects ?? initialProjects;

  const openEditDialog = (project: ProjectWithCount) => {
    setEditProjectName(project.name);
    setEditProjectDescription(project.description ?? "");
    setProjectOverlay({ mode: "edit", project });
  };

  const openDeleteDialog = (project: ProjectWithCount) => {
    setProjectOverlay({ mode: "delete", project });
  };

  const handleEditProject = async () => {
    if (projectOverlay?.mode !== "edit") return;

    const name = editProjectName.trim();
    if (!name) return;

    try {
      await updateProject.mutateAsync({
        id: projectOverlay.project.id,
        name,
        description: editProjectDescription.trim() || null,
      });
      setProjectOverlay(null);
      setEditProjectName("");
      setEditProjectDescription("");
    } catch {
      toast.error("Could not update project. Please try again.");
    }
  };

  const handleDeleteProject = async () => {
    if (projectOverlay?.mode !== "delete") return;

    try {
      await deleteProject.mutateAsync(projectOverlay.project.id);
      setProjectOverlay(null);
    } catch {
      toast.error("Could not delete project. Please try again.");
    }
  };

  const {
    onTouchStart: onProjectLongPressStart,
    onTouchEnd: onProjectLongPressEnd,
    onTouchMove: onProjectLongPressMove,
    consumeLongPressPayload,
  } = useLongPress<string>({
    enabled: isMobile,
    onLongPress: (projectId) => {
      const project = projects.find((item) => item.id === projectId);
      if (project) {
        setProjectOverlay({ mode: "actions", project });
      }
    },
  });

  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pt-12 md:p-8 md:pt-12">
        <h1 className="font-semibold text-2xl">Projects</h1>

        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No projects yet. Create one from the sidebar.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="group/project relative">
                <Link
                  href={`/projects/${project.id}`}
                  onClick={(event) => {
                    if (isMobile && consumeLongPressPayload() === project.id) {
                      event.preventDefault();
                    }
                  }}
                  onTouchStart={() => onProjectLongPressStart(project.id)}
                  onTouchEnd={onProjectLongPressEnd}
                  onTouchMove={onProjectLongPressMove}
                >
                  <Card className="transition-colors hover:bg-muted/50 group-hover/project:bg-muted/50">
                    <CardHeader className="pr-12">
                      <div className="flex items-center gap-2">
                        <Folder className="size-4 shrink-0 text-muted-foreground" />
                        <CardTitle className="min-w-0 truncate text-base">
                          {project.name}
                        </CardTitle>
                      </div>
                      {project.description ? (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardFooter className="flex items-center justify-between text-muted-foreground text-xs">
                      <p>
                        Updated{" "}
                        {formatTimeAgo(
                          new Date(project.lastActivityAt || project.updatedAt)
                        )}
                      </p>
                      <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                        <MessageSquare className="size-3" />
                        <span className="text-sm">{project.conversationCount}</span>
                      </span>
                    </CardFooter>
                  </Card>
                </Link>

                {!isMobile && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 z-10 size-8 rounded-lg opacity-0 transition-opacity focus-visible:opacity-100 group-hover/project:opacity-100 data-[state=open]:opacity-100"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6}>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditDialog(project);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDeleteDialog(project);
                        }}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Drawer
        open={projectOverlay?.mode === "actions"}
        onOpenChange={(open) => {
          if (!open) {
            setProjectOverlay(null);
          }
        }}
      >
        <DrawerContent className="rounded-t-3xl pb-2">
          <DrawerHeader className="pb-2 text-center">
            <DrawerTitle className="text-base">Actions</DrawerTitle>
            <DrawerDescription className="line-clamp-1 text-foreground text-sm">
              {projectOverlay?.project.name}
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 px-4 py-2">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full justify-center rounded-xl"
              onClick={() => {
                if (!projectOverlay) return;
                openEditDialog(projectOverlay.project);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="h-12 w-full justify-center rounded-xl"
              onClick={() => {
                if (!projectOverlay) return;
                openDeleteDialog(projectOverlay.project);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
          <DrawerFooter className="mt-2 border-t pt-4">
            <DrawerClose asChild>
              <Button variant="outline" size="lg" className="h-12 w-full rounded-xl">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={projectOverlay?.mode === "edit"}
        onOpenChange={(open) => {
          if (!open) {
            setProjectOverlay(null);
            setEditProjectName("");
            setEditProjectDescription("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-project-name" className="font-medium text-sm">
                Name
              </label>
              <Input
                id="edit-project-name"
                placeholder="Project name"
                value={editProjectName}
                onChange={(event) => setEditProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleEditProject();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-project-description" className="font-medium text-sm">
                Description
              </label>
              <Input
                id="edit-project-description"
                placeholder="Optional description"
                value={editProjectDescription}
                onChange={(event) => setEditProjectDescription(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditProject}
              disabled={!editProjectName.trim() || updateProject.isPending}
            >
              {updateProject.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={projectOverlay?.mode === "delete"}
        onOpenChange={(open) => {
          if (!open && deleteProject.isPending) {
            return;
          }
          if (!open) {
            setProjectOverlay(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              Conversations won&apos;t be deleted, they will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProject.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteProject();
              }}
              disabled={deleteProject.isPending}
              className={cn(deleteProject.isPending && "min-w-28")}
            >
              {deleteProject.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
