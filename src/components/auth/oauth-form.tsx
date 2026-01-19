"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import OAuthButton from "@/components/auth/oauth-button";
import { signIn } from "@/lib/auth-client";
import publicConf from "@/lib/public-config";

export default function OAuthForm({ provider }: { provider: string }) {
  const [isLoading, setIsLoading] = useState(false);
  let title = "";

  if (provider === "google") {
    title = "Sign in with Google";
  }

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
