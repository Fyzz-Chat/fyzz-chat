"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { FastLink } from "@/components/v3/fast-link";
import { useTranslations } from "@/lib/contexts/translations-context";
import { getProviderIcon, providerIcons } from "@/lib/providers";
import {
  useConversations,
  useDeleteConversation,
  usePrefetchConversation,
} from "@/lib/queries/conversations";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/stores/model-store";
import { useSearchStore } from "@/stores/search-store";
import type { PartialConversation } from "@/types/chat";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { createElement, use, useState } from "react";
import type React from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function groupConversationsByTime(conversations: PartialConversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups = {
    today: [] as PartialConversation[],
    yesterday: [] as PartialConversation[],
    lastWeek: [] as PartialConversation[],
    older: [] as PartialConversation[],
  };

  conversations
    .filter((conv) => !!conv)
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
}: {
  conversations: { items: any; nextCursor: string | undefined };
  authorized: boolean;
}) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const { searchQuery } = useSearchStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations(
    conversations,
    authorized,
    searchQuery
  );

  const allConversations = data?.pages.flatMap((page) => page.items) || [];
  const groupedConversations = groupConversationsByTime(allConversations);

  // Setup intersection observer for infinite scroll using react-intersection-observer
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0,
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto no-scrollbar">
      {groupedConversations.today.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70">
            {translations.sidebar.separators.today}
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {groupedConversations.today.map((chat: PartialConversation) => (
              <ConversationLink key={chat.id} chat={chat} />
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
              <ConversationLink key={chat.id} chat={chat} />
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
              <ConversationLink key={chat.id} chat={chat} />
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
              <ConversationLink key={chat.id} chat={chat} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {isFetchingNextPage && (
        <div className="h-4 w-full pb-4">
          <div className="flex items-center justify-center p-2">
            <div className="flex gap-1">
              <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]"></div>
              <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]"></div>
              <div className="size-2 rounded-full bg-muted animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      {/* Intersection observer target */}
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

function ConversationLink({
  chat,
}: {
  chat: PartialConversation;
}) {
  const { id } = useParams();
  const currentId = id as string;

  const deleteConversation = useDeleteConversation();
  const navigate = useNavigate();
  const providers = useModelStore((state) => state.providers);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const providerIcon = getProviderIcon(providers, chat.model);
  const prefetchConversation = usePrefetchConversation();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteConversation.mutateAsync({
        conversationId: chat.id,
      });
      if (currentId === chat.id) {
        navigate("/chat");
      }
      setIsModalOpen(false);
    } catch (_) {
      toast.error("Could not delete conversation. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    // Prevent modal from closing while delete operation is in progress
    if (!open && isDeleting) {
      return;
    }
    setIsModalOpen(open);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default AlertDialogAction behavior
    handleDelete();
  };

  return (
    <div className="group/chat relative">
      <FastLink
        to={`/chat/${chat.id}`}
        prefetchFunction={() => prefetchConversation(chat.id)}
        className={cn(
          "flex w-full flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-colors",
          currentId === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
        )}
      >
        <div className="flex w-full items-center gap-2">
          {providerIcon ? (
            createElement(providerIcons[providerIcon as keyof typeof providerIcons], {
              size: 16,
              className: "shrink-0",
            })
          ) : (
            <MessageSquare size={16} />
          )}
          <span className="inline-block whitespace-nowrap truncate">{chat.title}</span>
          <div className="hidden group-hover/chat:inline-flex size-5" />
        </div>
        {chat?.messages?.length > 0 && (
          <p
            className={cn(
              "text-xs text-muted-foreground truncate w-full",
              currentId === chat.id && "text-accent-foreground"
            )}
          >
            {chat.messages[chat.messages.length - 1]?.content}
          </p>
        )}
      </FastLink>
      <AlertDialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 hidden group-hover/chat:inline-flex items-center justify-center p-2 size-5 hover:bg-transparent z-10"
          >
            <Trash2
              size={16}
              className={cn(
                "text-muted-foreground",
                currentId === chat.id && "text-accent-foreground"
              )}
            />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't see this conversation ever again.
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
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
