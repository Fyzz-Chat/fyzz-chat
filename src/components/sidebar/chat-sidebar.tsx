"use client";

import { Check, FolderInput, Loader2, MoreVertical, Split, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { memo, use, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useLongPress } from "@/hooks/use-long-press";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { getProviderIcon } from "@/lib/providers";
import { useConversations, useDeleteConversation } from "@/lib/queries/conversations";
import { useAssignConversationToProject, useProjects } from "@/lib/queries/projects";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import { useSearchStore } from "@/stores/search-store";
import type { PartialConversation } from "@/types/chat";

function groupConversationsByTime(conversations: PartialConversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: {
    today: PartialConversation[];
    yesterday: PartialConversation[];
    lastWeek: PartialConversation[];
    older: PartialConversation[];
  } = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };

  conversations
    .filter((conv) => conv.lastMessageAt)
    .forEach((conv) => {
      const convDate = new Date(conv.lastMessageAt);
      if (convDate >= today) {
        groups.today.push(conv);
      } else if (convDate >= yesterday && convDate < today) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek && convDate < yesterday) {
        groups.lastWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

  return groups;
}

export default function ChatSidebar({
  conversations,
  authorized,
  projectId,
}: Readonly<{
  // biome-ignore lint/suspicious/noExplicitAny: TODO: Need further investigation
  conversations: { items: any; nextCursor: string | undefined };
  authorized: boolean;
  projectId?: string | null;
}>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { searchQuery } = useSearchStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations(
    authorized,
    {
      initialData: conversations,
      search: searchQuery,
      projectId,
    }
  );
  const allConversations = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const groupedConversations = groupConversationsByTime(allConversations);

  return (
    <div className="flex flex-col">
      {groupedConversations.today.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">
            {translations.sidebar.separators.today}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.today.map((chat: PartialConversation) => (
              <MemoizedConversationLink key={chat.id} chat={chat} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {groupedConversations.yesterday.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">
            {translations.sidebar.separators.yesterday}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.yesterday.map((chat: PartialConversation) => (
              <MemoizedConversationLink key={chat.id} chat={chat} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {groupedConversations.lastWeek.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">
            {translations.sidebar.separators.lastWeek}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.lastWeek.map((chat: PartialConversation) => (
              <MemoizedConversationLink key={chat.id} chat={chat} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      {groupedConversations.older.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">
            {translations.sidebar.separators.older}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.older.map((chat: PartialConversation) => (
              <MemoizedConversationLink key={chat.id} chat={chat} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {isFetchingNextPage && (
        <div className="h-4 w-full pb-4">
          <div className="flex items-center justify-center p-2">
            <div className="flex gap-1">
              <div className="size-2 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]"></div>
              <div className="size-2 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]"></div>
              <div className="size-2 animate-bounce rounded-full bg-muted"></div>
            </div>
          </div>
        </div>
      )}
      {hasNextPage && <div ref={ref} className="h-4 w-full pb-4" />}
      {allConversations.length === 0 && searchQuery && (
        <SidebarGroup>
          <SidebarGroupLabel className="inline-flex items-center justify-center text-muted-foreground">
            No conversations found
          </SidebarGroupLabel>
        </SidebarGroup>
      )}
    </div>
  );
}

function ConversationLink({ chat }: Readonly<{ chat: PartialConversation }>) {
  const params = useParams();
  const currentId = params.id as string;

  const deleteConversation = useDeleteConversation();
  const assignConversation = useAssignConversationToProject();
  const { data: projectsData } = useProjects();
  const router = useRouter();
  const providers = useModelStore((state) => state.providers);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const ProviderIcon = useMemo(
    () => getProviderIcon(providers, chat.model),
    [providers, chat.model]
  );

  const projects = projectsData?.projects ?? [];

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteConversation.mutateAsync({
        conversationId: chat.id,
      });
      if (currentId === chat.id) {
        router.push("/chat");
      }
      setIsModalOpen(false);
    } catch (_) {
      toast.error("Could not delete conversation. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open && isDeleting) {
      return;
    }
    setIsModalOpen(open);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDelete();
  };

  const handleMoveToProject = (projectId: string | null) => {
    assignConversation.mutate({ conversationId: chat.id, projectId });
    setDrawerOpen(false);
  };

  const openDeleteDialog = () => {
    setDrawerOpen(false);
    setIsModalOpen(true);
  };

  const {
    onTouchStart: onLongPressStart,
    onTouchEnd: onLongPressEnd,
    onTouchMove: onLongPressMove,
    consumeLongPressPayload,
  } = useLongPress<string>({
    enabled: isMobile,
    onLongPress: () => {
      setDrawerOpen(true);
    },
  });

  return (
    <>
      <div className="group/chat relative">
        <Link
          href={`/chat/${chat.id}`}
          className={cn(
            "flex min-h-16 w-full touch-manipulation select-none flex-col items-start gap-1 rounded-lg p-3.5 text-left text-[15px] transition-colors sm:min-h-0 sm:p-3 sm:text-sm",
            currentId === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          )}
          onTouchStart={() => onLongPressStart(chat.id)}
          onTouchEnd={(event) => {
            onLongPressEnd();
            if (consumeLongPressPayload() === chat.id) {
              event.preventDefault();
            }
          }}
          onTouchMove={onLongPressMove}
        >
          <div className="flex w-full items-center gap-2 sm:pr-6">
            {ProviderIcon}
            {chat.branchedFrom && (
              <Split className="size-4 shrink-0 text-(--theme-blue)" />
            )}
            <span className="inline-block truncate whitespace-nowrap">{chat.title}</span>
          </div>
        </Link>

        {/* Desktop: 3-dot menu */}
        {!isMobile && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-none absolute top-2 right-2 z-10 inline-flex size-7 items-center justify-center p-1 opacity-0 transition-opacity hover:bg-accent/50 group-hover/chat:pointer-events-auto group-hover/chat:opacity-100 data-[state=open]:pointer-events-auto data-[state=open]:opacity-100"
              >
                <MoreVertical
                  size={16}
                  className={cn(
                    "text-muted-foreground",
                    currentId === chat.id && "text-accent-foreground"
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48"
              side="right"
              align="start"
              sideOffset={4}
              avoidCollisions={false}
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <FolderInput className="size-4" />
                  Move to Project
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48" alignOffset={-4}>
                  <DropdownMenuItem onClick={() => handleMoveToProject(null)}>
                    Unassigned
                  </DropdownMenuItem>
                  {projects.length > 0 && <DropdownMenuSeparator />}
                  {projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => handleMoveToProject(project.id)}
                    >
                      {project.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsModalOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile: Drawer */}
      {isMobile && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="rounded-t-3xl pb-2">
            <DrawerHeader className="pb-2 text-center">
              <DrawerTitle className="text-base">Actions</DrawerTitle>
              <DrawerDescription className="space-y-1 text-center">
                <span className="line-clamp-1 block text-foreground text-sm">
                  {chat.title}
                </span>
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-4 px-4 py-2">
              <div className="rounded-2xl border bg-muted/30 p-1">
                <div className="px-3 pt-2 pb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Project
                </div>
                <div className="max-h-[34svh] space-y-1 overflow-y-auto px-1 pb-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-12 w-full justify-between rounded-xl px-3 text-sm",
                      chat.projectId === null && "text-(--theme-blue)"
                    )}
                    disabled={assignConversation.isPending}
                    onClick={() => handleMoveToProject(null)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FolderInput
                        className={cn(
                          "size-4 text-muted-foreground",
                          chat.projectId === null && "text-(--theme-blue)"
                        )}
                      />
                      Unassigned
                    </span>
                    {chat.projectId === null && (
                      <Check className="size-4 text-(--theme-blue)" />
                    )}
                  </Button>
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant="ghost"
                      className={cn(
                        "h-12 w-full justify-between rounded-xl px-3 text-sm",
                        chat.projectId === project.id && "text-(--theme-blue)"
                      )}
                      disabled={assignConversation.isPending}
                      onClick={() => handleMoveToProject(project.id)}
                    >
                      <span className="inline-flex items-center gap-2">
                        <FolderInput
                          className={cn(
                            "size-4 text-muted-foreground",
                            chat.projectId === project.id && "text-(--theme-blue)"
                          )}
                        />
                        {project.name}
                      </span>
                      {chat.projectId === project.id && (
                        <Check className="size-4 text-(--theme-blue)" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DrawerFooter className="space-y-1 pt-2">
              <Button
                variant="destructive"
                size="lg"
                className="h-12 rounded-xl"
                disabled={isDeleting}
                onClick={openDeleteDialog}
              >
                <Trash2 className="size-4" />
                Delete Conversation
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" size="lg" className="h-12 rounded-xl">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      <AlertDialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You won&apos;t see this conversation ever again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="w-20"
            >
              {isDeleting ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
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

const MemoizedConversationLink = memo(ConversationLink);
