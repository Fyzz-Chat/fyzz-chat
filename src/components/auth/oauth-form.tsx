"use client";

import OAuthButton from "@/components/auth/oauth-button";
import { signIn } from "@/lib/auth-client";
import publicConf from "@/lib/public-config";
import type { FormEvent } from "react";

export default function OAuthForm({ provider }: { provider: string }) {
  let config: { title: string } = { title: "" };

  if (provider === "google") {
    config.title = "Google";
  } else if (provider === "github") {
    config.title = "GitHub";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await signIn.social({
      provider,
      callbackURL: publicConf.redirectPath,
    });
  }

  return (
    <form className="flex justify-center" onSubmit={handleSubmit}>
      <OAuthButton provider={provider} title={config.title} />
    </form>
  );
}
