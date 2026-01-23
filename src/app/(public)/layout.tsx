import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { Suspense } from "react";
import { auth } from "@/auth";
import CatalystBadge from "@/components/footer/catalyst-badge";
import GitHub from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

async function HeaderItems() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      {session ? (
        <Button asChild className="w-28">
          <Link href="/chat">Dashboard</Link>
        </Button>
      ) : (
        <>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </>
      )}
    </>
  );
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-end gap-4 p-4">
        <Link
          href="/chat"
          className="mr-auto flex items-center gap-2 whitespace-pre font-medium text-lg"
        >
          <Image src="/icon.svg" alt="Fyzz.chat" width={30} height={30} />
          Fyzz.chat
        </Link>
        <Suspense fallback={<Skeleton className="h-10 w-28" />}>
          <HeaderItems />
        </Suspense>
      </header>
      {children}
      <footer className="mx-auto flex w-full max-w-7xl items-center justify-between p-4">
        <CatalystBadge />
        <div className="flex size-6 text-foreground">
          <a
            href="https://github.com/Fyzz-chat/fyzz-chat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHub size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}
