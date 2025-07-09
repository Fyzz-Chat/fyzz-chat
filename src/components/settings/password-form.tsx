"use client";

import useToast from "@/hooks/use-toast";
import { updateUserPassword } from "@/lib/actions/users";
import { initialState } from "@/lib/utils";
import type { Translations } from "@/types/locale";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function PasswordForm({
  hasPassword,
  translations,
}: {
  hasPassword: boolean;
  translations: Translations["settings"]["security"];
}) {
  const [state, formAction, isPending] = useActionState(updateUserPassword, initialState);

  useToast(state);

  return (
    <form className="flex flex-col gap-2" action={formAction}>
      {hasPassword && (
        <div>
          <Label htmlFor="current-password">{translations.currentPassword}</Label>
          <Input type="password" id="current-password" name="current-password" required />
        </div>
      )}
      <div>
        <Label htmlFor="new-password">{translations.newPassword}</Label>
        <Input type="password" id="new-password" name="new-password" required />
      </div>
      <div>
        <Label htmlFor="confirm-password">{translations.confirmPassword}</Label>
        <Input type="password" id="confirm-password" name="confirm-password" required />
      </div>
      <Button type="submit" className="self-end mt-4 px-5" disabled={isPending}>
        {translations.saveButton}
      </Button>
    </form>
  );
}
