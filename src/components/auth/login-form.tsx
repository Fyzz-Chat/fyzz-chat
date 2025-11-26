"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import Link from "next/link";
import { type FormEvent, use, useTransition } from "react";
import { toast } from "sonner";
import PendingSubmitButton from "./pending-submit-button";

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      await signIn.email(
        {
          email,
          password,
          callbackURL: publicConf.redirectPath,
        },
        {
          onSuccess: () => {
            localStorage.setItem("fyzz-auth-method", "password");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">{translations.login.email.label}</Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder={translations.login.email.placeholder}
          required
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{translations.login.password}</Label>
          <Link
            href="/reset-password/request"
            className="text-xs text-primary hover:underline underline-offset-4"
          >
            {translations.login.forgotPassword}
          </Link>
        </div>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="****************"
          required
        />
      </div>
      <PendingSubmitButton
        isPending={isPending}
        text={translations.login.signIn}
        className="w-full mt-2"
      />
    </form>
  );
}
