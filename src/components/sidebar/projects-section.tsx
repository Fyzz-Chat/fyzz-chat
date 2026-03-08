"use client";

import { Folder, FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useCreateProject, useProjects } from "@/lib/queries/projects";
import { cn } from "@/lib/utils";
import type { ProjectWithCount } from "@/types/chat";

interface ProjectsSectionProps {
  initialProjects: ProjectWithCount[];
}

export function ProjectsSection({ initialProjects }: Readonly<ProjectsSectionProps>) {
  const pathname = usePathname();
  useProjects({ projects: initialProjects });
  const createProject = useCreateProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject.mutateAsync({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || null,
    });
    setNewProjectName("");
    setNewProjectDescription("");
    setIsCreateDialogOpen(false);
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
                    Enter a name and optional description for your new project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="create-project-name" className="font-medium text-sm">
                      Name
                    </label>
                    <Input
                      id="create-project-name"
                      placeholder="Project name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateProject();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="create-project-description"
                      className="font-medium text-sm"
                    >
                      Description
                    </label>
                    <Input
                      id="create-project-description"
                      placeholder="Optional description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                    />
                  </div>
                </div>
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
