"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { useTranslations } from "@/lib/contexts/translations-context";
import { type FormEvent, use, useTransition } from "react";
import { toast } from "sonner";

export default function PasswordResetForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    if (password !== confirmPassword) {
      toast.error(translations.resetPassword.mismatch);
      return;
    }

    startTransition(async () => {
      await resetPassword(
        {
          newPassword: password,
          token,
        },
        {
          onSuccess: () => {
            toast.success(translations.resetPassword.success);
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="password">{translations.resetPassword.password}</Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="****************"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">
          {translations.resetPassword.confirmPassword}
        </Label>
        <Input
          type="password"
          id="confirm-password"
          name="confirm-password"
          placeholder="****************"
          required
        />
      </div>
      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {translations.resetPassword.submit}
      </Button>
    </form>
  );
}
