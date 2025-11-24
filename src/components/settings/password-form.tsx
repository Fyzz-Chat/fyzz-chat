"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUserPassword } from "@/lib/actions/users";
import { changePassword } from "@/lib/auth-client";
import { useTranslations } from "@/lib/contexts/translations-context";
import { type FormEvent, use, useTransition } from "react";
import { toast } from "sonner";

export default function PasswordForm({
  hasPassword,
}: {
  hasPassword?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const currentPassword = formData.get("current-password") as string;
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      if (hasPassword) {
        await changePassword(
          {
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
          },
          {
            onSuccess: () => {
              toast.success("Password updated");
            },
            onError: (error) => {
              toast.error(error.error.message);
            },
          }
        );
      } else {
        const result = await setUserPassword(newPassword);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      }
    });
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      {hasPassword && (
        <div>
          <Label htmlFor="current-password">
            {translations.settings.security.currentPassword}
          </Label>
          <Input type="password" id="current-password" name="current-password" required />
        </div>
      )}
      <div>
        <Label htmlFor="new-password">{translations.settings.security.newPassword}</Label>
        <Input type="password" id="new-password" name="new-password" required />
      </div>
      <div>
        <Label htmlFor="confirm-password">
          {translations.settings.security.confirmPassword}
        </Label>
        <Input type="password" id="confirm-password" name="confirm-password" required />
      </div>
      <Button type="submit" className="self-end mt-4 px-5" disabled={isPending}>
        {translations.settings.security.saveButton}
      </Button>
    </form>
  );
}
