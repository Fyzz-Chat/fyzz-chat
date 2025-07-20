"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { registerUser } from "@/lib/actions/users";
import publicConf from "@/lib/public-config";
import { type FormState, initialState } from "@/lib/utils";
import { useInputStore } from "@/stores/input-store";
import type { Translations } from "@/types/locale";
import { ExternalLink } from "lucide-react";
import { useActionState } from "react";
import PendingSubmitButton from "./pending-submit-button";

export default function RegisterForm({
  translations,
}: { translations: Translations["register"] }) {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);
  const input = useInputStore((state) => state.input);

  const toastCallback = (state: FormState) => {
    if (state.success) {
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
      <Label htmlFor="name" className="space-y-1">
        <span>{translations.name.label}</span>
        <Input
          type="text"
          id="name"
          name="name"
          placeholder={translations.name.placeholder}
          required
          autoFocus
        />
      </Label>
      <Label htmlFor="email" className="space-y-1">
        <span>{translations.email.label}</span>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder={translations.email.placeholder}
          required
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
      <div className="text-xs text-muted-foreground mt-2">
        {translations.privacyPolicy.text}{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          className="text-primary hover:underline inline-flex items-center relative"
        >
          <span>{translations.privacyPolicy.link}</span>
          <ExternalLink size={10} className="ml-1 relative top-[-1px]" />
        </a>
      </div>
      <PendingSubmitButton
        isPending={isPending}
        text={translations.signUp}
        className="mt-[18px]"
      />
    </form>
  );
}
