import { ChatLayoutWrapper } from "@/components/chat/chat-layout-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <ChatLayoutWrapper>
      <div className="flex h-[calc(100svh-132px)] flex-col overflow-auto md:h-[calc(100svh-164px)]">
        <div className="flex flex-col gap-4 p-4 md:p-8">
          <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
          <Skeleton className="h-20 w-3/4 rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
          <Skeleton className="h-14 w-2/3 rounded-2xl" />
        </div>
      </div>
    </ChatLayoutWrapper>
  );
}
