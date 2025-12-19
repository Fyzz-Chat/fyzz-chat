"use client";

import { type FormEvent, use, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { useTranslations } from "@/lib/contexts/translations-context";

export default function PasswordResetForm({ token }: { token: string }) {
  const [isPending, setIsPending] = useState(false);
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

    setIsPending(true);
    try {
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
            toast.error(error.error.message || "Failed to reset password");
          },
        }
      );
    } finally {
      setIsPending(false);
    }
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
      <Button type="submit" className="mt-2 w-full" disabled={isPending}>
        {translations.resetPassword.submit}
      </Button>
    </form>
  );
}
