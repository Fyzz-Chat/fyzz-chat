import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import LastUsedIndicator from "@/components/auth/last-used-indicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PendingSubmitButton({
  isPending,
  text,
  className,
  ...props
}: Readonly<
  ComponentProps<typeof Button> & {
    isPending: boolean;
    text: string;
  }
>) {
  return (
    <Button
      size="lg"
      disabled={isPending}
      className={cn("relative h-12", className)}
      {...props}
    >
      {isPending ? <LoaderCircle className="animate-spin" size={18} /> : text}
      <LastUsedIndicator provider="email" />
    </Button>
  );
}
