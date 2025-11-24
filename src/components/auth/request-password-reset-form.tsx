"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { type FormEvent, use, useTransition } from "react";
import { toast } from "sonner";

export default function RequestPasswordResetForm() {
  const [isPending, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    startTransition(async () => {
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
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">{translations.login.email.label}</Label>
        <Input type="email" id="email" name="email" />
      </div>
      <Button type="submit" className="self-end mt-4 px-5" disabled={isPending}>
        Submit
      </Button>
    </form>
  );
}
