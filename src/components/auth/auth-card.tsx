import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthCard({
  title,
  description,
  children,
  ctaQuestion,
  ctaText,
  ctaLink,
}: Readonly<{
  title: string;
  description: string;
  children: ReactNode;
  ctaQuestion: string;
  ctaText: string;
  ctaLink: string;
}>) {
  return (
    <div className="flex w-full max-w-[400px] flex-col items-center justify-center gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-bold text-2xl tracking-tight">{title}</h1>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      <div className="w-full px-4">{children}</div>
      <div>
        <p className="mx-auto text-muted-foreground text-sm">
          {ctaQuestion}{" "}
          <Link
            href={ctaLink}
            className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            {ctaText}
          </Link>
        </p>
      </div>
    </div>
  );
}
