"use client";

import {
  ExternalLink,
  Folder,
  FolderOpen,
  Loader2,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLongPress } from "@/hooks/use-long-press";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUnassignedConversationsCount,
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
  initialUnassignedCount,
  selectedProjectId,
  onSelectProject,
}: ProjectsSectionProps) {
  const pathname = usePathname();
  const { data: projectsData } = useProjects();
  const { data: unassignedCountData } = useUnassignedConversationsCount();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectOverlay, setProjectOverlay] = useState<ProjectOverlayState | null>(null);
  const [renameProjectName, setRenameProjectName] = useState("");

  // Use server-fetched data initially, then React Query data when available
  const projects = projectsData?.projects ?? initialProjects;
  const unassignedCount = unassignedCountData?.count ?? initialUnassignedCount;

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject.mutateAsync(newProjectName.trim());
    setNewProjectName("");
    setIsCreateDialogOpen(false);
  };

  const openProjectActions = (project: ProjectWithCount) => {
    setProjectOverlay({ mode: "actions", project });
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

  const {
    onTouchStart: onProjectLongPressStart,
    onTouchEnd: onProjectLongPressEnd,
    onTouchMove: onProjectLongPressMove,
    consumeLongPressPayload: consumeProjectLongPressPayload,
  } = useLongPress<string>({
    enabled: isMobile,
    onLongPress: (projectId) => {
      const project = projects.find((item) => item.id === projectId);
      if (project) {
        openProjectActions(project);
      }
    },
  });

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
                <Folder className="size-4" />
                <span>All Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* All Conversations */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSelectProject(null)}
              className={cn(
                selectedProjectId === null && "bg-accent text-accent-foreground"
              )}
            >
              {selectedProjectId === null ? (
                <FolderOpen className="size-4" />
              ) : (
                <Folder className="size-4" />
              )}
              <span>All Conversations</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Unassigned */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSelectProject("unassigned")}
              className={cn(
                selectedProjectId === "unassigned" && "bg-accent text-accent-foreground"
              )}
            >
              {selectedProjectId === "unassigned" ? (
                <FolderOpen className="size-4" />
              ) : (
                <Folder className="size-4" />
              )}
              <span className="flex-1">Unassigned</span>
              {unassignedCount > 0 && (
                <span className="text-muted-foreground text-xs">{unassignedCount}</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Project List */}
          {projects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton
                onClick={() => {
                  if (isMobile && consumeProjectLongPressPayload() === project.id) {
                    return;
                  }
                  onSelectProject(project.id);
                }}
                onTouchStart={() => onProjectLongPressStart(project.id)}
                onTouchEnd={onProjectLongPressEnd}
                onTouchMove={onProjectLongPressMove}
                className={cn(
                  !isMobile && "pr-10",
                  selectedProjectId === project.id && "bg-accent text-accent-foreground"
                )}
              >
                {selectedProjectId === project.id ? (
                  <FolderOpen className="size-4" />
                ) : (
                  <Folder className="size-4" />
                )}
                <span className="flex-1 truncate">{project.name}</span>
              </SidebarMenuButton>

              {!isMobile && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      <MoreVertical className="size-4" />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" sideOffset={4}>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}`}>
                        <ExternalLink className="mr-2 size-4" />
                        Open
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        openRenameDialog(project);
                      }}
                    >
                      <Pencil className="mr-2 size-4" />
                      Rename
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
            </SidebarMenuItem>
          ))}

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
