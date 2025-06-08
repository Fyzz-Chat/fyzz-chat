import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div
      className={cn(
        "flex space-x-1 bg-muted rounded-lg p-4 w-fit h-14 items-center justify-center",
        className
      )}
    >
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_0ms]" />
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_200ms]" />
      <div className="w-1.5 h-1.5 bg-current rounded-full animate-[bounce_1s_infinite_400ms]" />
    </div>
  );
}
