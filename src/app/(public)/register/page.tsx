import AuthCard from "@/components/auth/auth-card";
import RegisterForm from "@/components/auth/register-form";
import { canonicalUrl, openGraph, twitter } from "@/lib/metadata";
import type { Metadata } from "next";

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

export default function Register() {
  return (
    <main className="m-auto">
      <AuthCard
        title="Let's get started!"
        description="Create an account to continue"
        ctaQuestion="Already have an account?"
        ctaText="Login"
        ctaLink="/login"
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
