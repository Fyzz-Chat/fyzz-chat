import type { Metadata } from "next";
import AnonymousLoginButton from "@/components/auth/anonymous-login-button";
import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import conf from "@/lib/config";
import { canonicalUrl, openGraph, twitter } from "@/lib/metadata";

const path = "/login";
const title = "Login - Fyzz.chat";
const description = "Sign in to your account to continue";

export const metadata: Metadata = {
  alternates: {
    canonical: `${canonicalUrl}${path}`,
  },
  title,
  description,
  openGraph: {
    ...openGraph,
    title,
    description,
    url: path,
  },
  twitter: {
    ...twitter,
    title,
    description,
  },
};

export default async function Login() {
  const translations = await getTranslations();

  if (conf.anonymousLogin) {
    return (
      <main className="m-auto">
        <Card>
          <CardHeader>
            <CardTitle>{translations.login.title}</CardTitle>
            <CardDescription>{translations.login.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnonymousLoginButton />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="m-auto">
      <AuthCard
        title={translations.login.title}
        description={translations.login.description}
        ctaQuestion={translations.login.firstTime.title}
        ctaText={translations.login.firstTime.link}
        ctaLink="/register"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
