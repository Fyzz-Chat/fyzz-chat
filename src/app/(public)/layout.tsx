import { auth } from "@/auth";
import CatalystBadge from "@/components/footer/catalyst-badge";
import GitHub from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { Suspense } from "react";

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
    <div className="flex flex-col flex-1 mx-auto max-w-7xl w-full">
      <header className="flex w-full p-4 gap-4 justify-end items-center">
        <Link
          href="/"
          className="flex gap-2 items-center mr-auto font-medium text-lg whitespace-pre"
        >
          <Image src="/icon.svg" alt="Catalyst" width={30} height={30} />
          Fyzz.chat
        </Link>
        <Suspense fallback={<Skeleton className="h-10 w-28" />}>
          <HeaderItems />
        </Suspense>
      </header>
      {children}
      <footer className="flex w-full p-4 justify-between items-center">
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
