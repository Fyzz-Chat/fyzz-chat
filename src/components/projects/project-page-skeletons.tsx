import { Skeleton } from "@/components/ui/skeleton";

export function ConversationsListSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-5 rounded-lg px-3 py-3.5"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
