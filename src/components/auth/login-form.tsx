"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Label htmlFor="email" className="space-y-1">
        <span>{translations.login.email.label}</span>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder={translations.login.email.placeholder}
          required
          autoFocus
        />
      </Label>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password" className="space-y-1">
          <span>{translations.login.password}</span>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="****************"
            required
          />
        </Label>
        <div className="text-xs text-muted-foreground text-right">
          <a
            href="/reset-password/request"
            className="text-primary hover:underline inline-flex items-center relative"
          >
            <span>Forgot password?</span>
          </a>
        </div>
      </div>
      <PendingSubmitButton
        isPending={isPending}
        text={translations.login.signIn}
        className="mt-2"
      />
    </form>
  );
}
