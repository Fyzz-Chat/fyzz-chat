import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh min-w-80 flex-col justify-center md:overscroll-none">
      <Button size="lg" variant="link" className="absolute top-4 left-4" asChild>
        <Link href="/chat" className="flex items-center gap-2">
          <MoveLeft className="size-4" />
          <span>Back to chat</span>
        </Link>
      </Button>
      {children}
    </div>
  );
}
