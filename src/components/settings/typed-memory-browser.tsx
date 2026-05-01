"use client";

import {
  Brain,
  Lightbulb,
  MessageSquare,
  ScrollText,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryType } from "@/types/memory";

export type MemoryItem = {
  id: string;
  type: MemoryType;
  content: string;
  confidence: number | null;
  category: string | null;
  source: string | null;
  createdAt: Date;
};

export type GroupedMemories = Record<MemoryType, MemoryItem[]>;

const TYPE_ORDER: MemoryType[] = [
  MemoryType.fact,
  MemoryType.opinion,
  MemoryType.learning,
  MemoryType.feedback,
  MemoryType.context,
];

const TYPE_META: Record<
  MemoryType,
  { label: string; icon: ComponentType<{ className?: string }>; description: string }
> = {
  [MemoryType.fact]: {
    label: "Facts",
    icon: Brain,
    description: "Concrete details about you, your role, and your context.",
  },
  [MemoryType.opinion]: {
    label: "Opinions",
    icon: Sparkles,
    description: "Patterns the AI has noticed, with confidence between 0 and 1.",
  },
  [MemoryType.learning]: {
    label: "Learnings",
    icon: Lightbulb,
    description: "Reusable insights from past conversations.",
  },
  [MemoryType.feedback]: {
    label: "Feedback",
    icon: MessageSquare,
    description: "Guidance you've given the AI about how to work.",
  },
  [MemoryType.context]: {
    label: "Context",
    icon: ScrollText,
    description: "Background information that frames the rest.",
  },
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.max(0, Math.min(1, confidence)) * 100;
  const tone =
    confidence >= 0.7
      ? "bg-primary"
      : confidence < 0.3
        ? "bg-destructive"
        : "bg-muted-foreground";
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Confidence ${confidence.toFixed(2)}`}
    >
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <span
          className={`block h-full ${tone} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="font-mono text-muted-foreground text-xs">
        {confidence.toFixed(2)}
      </span>
    </span>
  );
}

function MemoryRow({
  memory,
  onDelete,
  isDeleting,
}: {
  memory: MemoryItem;
  onDelete: (memory: MemoryItem) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-md border px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {memory.type === MemoryType.opinion && memory.confidence !== null && (
            <ConfidenceBar confidence={memory.confidence} />
          )}
          {memory.category && (
            <Badge variant="outline" className="text-xs">
              {memory.category}
            </Badge>
          )}
          {(memory.type === MemoryType.learning ||
            memory.type === MemoryType.feedback) && (
            <span className="text-muted-foreground text-xs">
              {formatDate(memory.createdAt)}
            </span>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm">{memory.content}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDelete(memory)}
        disabled={isDeleting}
        aria-label="Delete memory"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function TypedMemoryBrowser({
  memories,
  onDelete,
  isDeleting = false,
  disabled = false,
  isLoading = false,
}: {
  memories: GroupedMemories;
  onDelete: (id: string) => Promise<void> | void;
  isDeleting?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryItem | null>(null);
  const totalCount = TYPE_ORDER.reduce((sum, t) => sum + (memories[t]?.length ?? 0), 0);

  async function handleConfirmDelete() {
    if (!memoryToDelete) return;
    const target = memoryToDelete;
    setMemoryToDelete(null);
    try {
      await onDelete(target.id);
    } catch {
      toast.error("Failed to delete memory");
    }
  }

  if (!isLoading && totalCount === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
        <Brain className="h-6 w-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">No memories yet.</p>
        <p className="max-w-xs text-muted-foreground text-xs">
          The AI will store relevant information here as you chat.
        </p>
      </div>
    );
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
      <Accordion type="multiple" defaultValue={[]} className="w-full">
        {TYPE_ORDER.map((type) => {
          const items = memories[type] ?? [];
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          return (
            <AccordionItem key={type} value={type}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{meta.label}</span>
                  {isLoading ? (
                    <Skeleton className="ml-1 h-5 w-7 rounded-md" />
                  ) : (
                    <Badge variant="secondary" className="ml-1 font-mono text-xs">
                      {items.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs">{meta.description}</p>
                  {items.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">
                      No {meta.label.toLowerCase()} yet.
                    </p>
                  ) : (
                    items.map((memory) => (
                      <MemoryRow
                        key={memory.id}
                        memory={memory}
                        onDelete={setMemoryToDelete}
                        isDeleting={isDeleting}
                      />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <AlertDialog
        open={memoryToDelete !== null}
        onOpenChange={(open) => !open && setMemoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this memory. The AI won't recall it in future
              conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
