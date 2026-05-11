import { Skeleton } from "@/components/ui/skeleton";

export function MemoriesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders
        <Skeleton key={i} className="h-8 w-full rounded-md" />
      ))}
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders
          <div key={i} className="border-b py-2 last:border-b-0">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConversationsListSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders, never reorder
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
