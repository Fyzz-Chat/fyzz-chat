"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import OAuthButton from "@/components/auth/oauth-button";
import { signIn } from "@/lib/auth-client";
import publicConf from "@/lib/public-config";

const PROVIDER_TITLES: Record<string, string> = {
  google: "Continue with Google",
};

export default function OAuthForm({ provider }: { provider: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const title = PROVIDER_TITLES[provider] ?? provider;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    await signIn.social({
      provider,
      callbackURL: publicConf.redirectPath,
    });
  }

  return (
    <form className="flex justify-center" onSubmit={handleSubmit}>
      <OAuthButton provider={provider} title={title} isLoading={isLoading} />
    </form>
  );
}
