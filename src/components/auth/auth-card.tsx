import Link from "next/link";
import { type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import conf from "@/lib/config";

export default function AuthCard({
  title,
  description,
  children,
  ctaQuestion,
  ctaText,
  ctaLink,
}: {
  title: string;
  description: string;
  children: ReactNode;
  ctaQuestion: string;
  ctaText: string;
  ctaLink: string;
}) {
  const hasGoogle = Boolean(conf.googleId) && Boolean(conf.googleSecret);

  return (
    <Card className="w-92 border-border/50 bg-card/95 shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-6 text-center">
        <CardTitle className="font-bold text-2xl tracking-tight">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 px-8">{children}</CardContent>
      <CardFooter className="pt-0 pb-8">
        <p className="mx-auto text-muted-foreground text-sm">
          {ctaQuestion}{" "}
          <Link
            href={ctaLink}
            className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            {ctaText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
