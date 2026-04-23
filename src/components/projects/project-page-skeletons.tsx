import { Skeleton } from "@/components/ui/skeleton";

export function ConversationsListSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-start justify-between gap-3 rounded-lg p-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function MemoriesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium text-sm">Memories</h3>
        <p className="text-muted-foreground text-xs">
          Information the AI remembers about this project.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border-b p-2 last:border-b-0">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium text-sm">Skills</h3>
        <p className="text-muted-foreground text-xs">
          Reusable instructions the AI activates for this project.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="border-b py-2 last:border-b-0">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
