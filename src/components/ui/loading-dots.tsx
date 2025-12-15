import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div
      className={cn(
        "flex h-[60px] w-fit items-center justify-center space-x-1 rounded-lg bg-muted p-4",
        className
      )}
    >
      <div className="h-1.5 w-1.5 animate-[bounce_1s_infinite_0ms] rounded-full bg-current" />
      <div className="h-1.5 w-1.5 animate-[bounce_1s_infinite_200ms] rounded-full bg-current" />
      <div className="h-1.5 w-1.5 animate-[bounce_1s_infinite_400ms] rounded-full bg-current" />
    </div>
  );
}
