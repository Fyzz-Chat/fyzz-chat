import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card";
import RegisterForm from "@/components/auth/register-form";
import { getTranslations } from "@/lib/backend/locale/dictionaries";
import { canonicalUrl, openGraph, twitter } from "@/lib/metadata";

const path = "/register";
const title = "Register - Fyzz.chat";
const description = "Create an account to continue";

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

export default async function Register() {
  const translations = await getTranslations();

  return (
    <main className="m-auto">
      <AuthCard
        title={translations.register.title}
        description={translations.register.description}
        ctaQuestion={translations.register.alreadyHaveAccount.title}
        ctaText={translations.register.alreadyHaveAccount.link}
        ctaLink="/login"
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
