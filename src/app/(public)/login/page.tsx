import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { canonicalUrl, openGraph, twitter } from "@/lib/metadata";
import type { Metadata } from "next";

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

  return (
    <main className="m-auto">
      <AuthCard
        title={translations.login.title}
        description={translations.login.description}
        ctaQuestion={translations.login.firstTime.title}
        ctaText={translations.login.firstTime.link}
        ctaLink="/register"
      >
        <LoginForm translations={translations.login} />
      </AuthCard>
    </main>
  );
}
