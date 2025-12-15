"use client";

import Link from "next/link";
import { type FormEvent, use, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";

export default function RequestPasswordResetForm() {
  const [isPending, setIsPending] = useState(false);
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    setIsPending(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        toast.success(result.message, {
          description: result.description,
        });
      } else {
        toast.error(result.message, {
          description: result.description,
        });
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
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
      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {translations.requestPasswordReset.submit}
      </Button>
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {translations.requestPasswordReset.backToLogin}
        </Link>
      </div>
    </form>
  );
}
