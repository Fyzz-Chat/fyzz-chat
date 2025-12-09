import OAuthForm from "@/components/auth/oauth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import conf from "@/lib/config";
import Link from "next/link";
import type { ReactNode } from "react";

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
  const hasGitHub = Boolean(conf.githubId) && Boolean(conf.githubSecret);
  const hasGoogle = Boolean(conf.googleId) && Boolean(conf.googleSecret);

  return (
    <Card className="w-92 border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
      <CardHeader className="text-center space-y-2 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 px-8">
        {children}
        {(hasGitHub || hasGoogle) && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
        )}
        {(hasGitHub || hasGoogle) && (
          <div className="flex flex-col gap-2">
            {hasGoogle && <OAuthForm provider="google" />}
            {hasGitHub && <OAuthForm provider="github" />}
          </div>
        )}
      </CardContent>
      <CardFooter className="pb-8 pt-0">
        <p className="mx-auto text-sm text-muted-foreground">
          {ctaQuestion}{" "}
          <Link
            href={ctaLink}
            className="font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
          >
            {ctaText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
