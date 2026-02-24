import { Github, MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-svh min-w-80 flex-col justify-center md:overscroll-none">
      <Button size="lg" variant="link" className="absolute top-4 left-4" asChild>
        <Link href="/chat" className="flex items-center gap-2">
          <MoveLeft className="size-4" />
          <span>Back to chat</span>
        </Link>
      </Button>
      <a
        href="https://github.com/Fyzz-Chat/fyzz-chat"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Star us on GitHub"
        className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground/50 transition-colors hover:text-foreground"
      >
        <Github className="size-5" />
      </a>
      {children}
    </div>
  );
}
