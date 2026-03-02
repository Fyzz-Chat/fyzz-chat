"use client";

import { Folder, FolderOpen, Plus } from "lucide-react";
import { useState } from "react";
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
  useProjects,
  useUnassignedConversationsCount,
} from "@/lib/queries/projects";
import { cn } from "@/lib/utils";
import type { ProjectWithCount } from "@/types/chat";

interface ProjectsSectionProps {
  initialProjects: ProjectWithCount[];
  initialUnassignedCount: number;
  selectedProjectId: string | null | "unassigned";
  onSelectProject: (projectId: string | null | "unassigned") => void;
}

export function ProjectsSection({
  initialProjects,
  initialUnassignedCount,
  selectedProjectId,
  onSelectProject,
}: ProjectsSectionProps) {
  const { data: projectsData } = useProjects();
  const { data: unassignedCountData } = useUnassignedConversationsCount();
  const createProject = useCreateProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use server-fetched data initially, then React Query data when available
  const projects = projectsData?.projects ?? initialProjects;
  const unassignedCount = unassignedCountData?.count ?? initialUnassignedCount;

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject.mutateAsync(newProjectName.trim());
    setNewProjectName("");
    setIsDialogOpen(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* All Conversations */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSelectProject(null)}
              className={cn(
                selectedProjectId === null && "bg-accent text-accent-foreground"
              )}
            >
              <FolderOpen className="size-4" />
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
              <Folder className="size-4" />
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
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  selectedProjectId === project.id && "bg-accent text-accent-foreground"
                )}
              >
                <Folder className="size-4" />
                <span className="flex-1 truncate">{project.name}</span>
                {project.conversationCount > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {project.conversationCount}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {/* Create Project Button */}
          <SidebarMenuItem>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </SidebarGroup>
  );
}
