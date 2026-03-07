"use client";

import {
  ExternalLink,
  Folder,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/lib/queries/projects";
import { cn } from "@/lib/utils";
import type { ProjectWithCount } from "@/types/chat";

interface ProjectsSectionProps {
  initialProjects: ProjectWithCount[];
  initialUnassignedCount: number;
  selectedProjectId: string | null | "unassigned";
  onSelectProject: (projectId: string | null | "unassigned") => void;
}

type ProjectOverlayState = {
  mode: "actions" | "rename" | "delete";
  project: ProjectWithCount;
};

export function ProjectsSection({
  initialProjects,
  initialUnassignedCount: _initialUnassignedCount,
  selectedProjectId,
  onSelectProject,
}: Readonly<ProjectsSectionProps>) {
  const pathname = usePathname();
  useProjects({ projects: initialProjects });
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectOverlay, setProjectOverlay] = useState<ProjectOverlayState | null>(null);
  const [renameProjectName, setRenameProjectName] = useState("");

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject.mutateAsync(newProjectName.trim());
    setNewProjectName("");
    setIsCreateDialogOpen(false);
  };

  const openRenameDialog = (project: ProjectWithCount) => {
    setRenameProjectName(project.name);
    setProjectOverlay({ mode: "rename", project });
  };

  const openDeleteDialog = (project: ProjectWithCount) => {
    setProjectOverlay({ mode: "delete", project });
  };

  const handleRenameProject = async () => {
    if (projectOverlay?.mode !== "rename") return;

    const name = renameProjectName.trim();
    if (!name) return;

    try {
      await updateProject.mutateAsync({
        id: projectOverlay.project.id,
        name,
      });
      setProjectOverlay(null);
      setRenameProjectName("");
    } catch {
      toast.error("Could not rename project. Please try again.");
    }
  };

  const handleDeleteProject = async () => {
    if (projectOverlay?.mode !== "delete") return;

    try {
      await deleteProject.mutateAsync(projectOverlay.project.id);

      if (selectedProjectId === projectOverlay.project.id) {
        onSelectProject(null);
      }

      setProjectOverlay(null);
    } catch {
      toast.error("Could not delete project. Please try again.");
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                pathname === "/projects" && "bg-accent text-accent-foreground"
              )}
            >
              <Link href="/projects">
                {pathname === "/projects" ? (
                  <FolderOpen className="size-4" />
                ) : (
                  <Folder className="size-4" />
                )}
                <span>All Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Create Project Button */}
          <SidebarMenuItem>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <SidebarMenuButton>
                  <Plus className="size-4" />
                  <span>Create Project</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new project.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateProject();
                    }
                  }}
                />
                <DialogFooter>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || createProject.isPending}
                  >
                    {createProject.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>

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
              asChild
            >
              <Link href={`/projects/${projectOverlay?.project.id}`}>
                <ExternalLink className="size-4" />
                Open
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full justify-center rounded-xl"
              onClick={() => {
                if (!projectOverlay) return;
                openRenameDialog(projectOverlay.project);
              }}
            >
              <Pencil className="size-4" />
              Rename
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
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" size="lg" className="h-12 w-full rounded-xl">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={projectOverlay?.mode === "rename"}
        onOpenChange={(open) => {
          if (!open) {
            setProjectOverlay(null);
            setRenameProjectName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>Choose a new name for this project.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Project name"
            value={renameProjectName}
            onChange={(event) => setRenameProjectName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleRenameProject();
              }
            }}
          />
          <DialogFooter>
            <Button
              onClick={handleRenameProject}
              disabled={!renameProjectName.trim() || updateProject.isPending}
            >
              {updateProject.isPending ? "Renaming..." : "Rename"}
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
    </SidebarGroup>
  );
}
