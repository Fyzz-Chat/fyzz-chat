import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
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

export default function Login() {
  return (
    <main className="m-auto">
      <AuthCard
        title="Welcome back!"
        description="Sign in to your account to continue"
        ctaQuestion="First time here?"
        ctaText="Sign up"
        ctaLink="/register"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
