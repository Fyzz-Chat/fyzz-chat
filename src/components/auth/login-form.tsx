"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { signInUser } from "@/lib/actions/users";
import publicConf from "@/lib/public-config";
import { type FormState, initialState } from "@/lib/utils";
import { useInputStore } from "@/stores/input-store";
import type { Translations } from "@/types/locale";
import { useActionState } from "react";
import PendingSubmitButton from "./pending-submit-button";

export default function LoginForm({
  translations,
}: { translations: Translations["login"] }) {
  const [state, formAction, isPending] = useActionState(signInUser, initialState);
  const { input } = useInputStore();

  const toastCallback = (state: FormState) => {
    if (state.message === "Signed in successfully") {
      localStorage.setItem("fyzz-auth-method", "password");

      if (input) {
        localStorage.setItem("fyzz-input-content", input);
      }

      window.location.href = publicConf.redirectPath;
    }
  };

  useToast(state, toastCallback);

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Label htmlFor="email" className="space-y-1">
        <span>{translations.email.label}</span>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder={translations.email.placeholder}
          required
          autoFocus
        />
      </Label>
      <Label htmlFor="password" className="space-y-1">
        <span>{translations.password}</span>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="****************"
          required
        />
      </Label>
      <PendingSubmitButton
        isPending={isPending}
        text={translations.signIn}
        className="mt-[18px]"
      />
    </form>
  );
}
