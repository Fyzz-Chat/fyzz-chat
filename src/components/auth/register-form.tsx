"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useActionState, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import TurnstileComponent from "@/components/turnstile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { registerUser } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import type { FormState } from "@/lib/utils";
import { initialState } from "@/lib/utils";
import { type RegisterFormData, registerSchema } from "@/types/auth";
import PendingSubmitButton from "./pending-submit-button";

export default function RegisterForm() {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [state, formAction, isPending] = useActionState(registerUser, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const router = useRouter();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      "cf-turnstile-response": "",
    },
  });

  const toastCallback = (state: FormState) => {
    if (state.success) {
      localStorage.setItem("fyzz-auth-method", "password");
      router.push(publicConf.redirectPath);
    } else {
      setValue("cf-turnstile-response", "");
      turnstileRef.current?.reset();
    }
  };

  useToast(state, toastCallback);

  const onSubmit = async (data: RegisterFormData) => {
    startTransition(() => {
      formAction(data);
    });
  };

  function setTurnstileValue(token: string) {
    setValue("cf-turnstile-response", token);
  }

  const isLoading = isPending || isSubmitting || isTransitionPending;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Label htmlFor="name" className="grid gap-2">
        <span>{translations.register.name.label}</span>
        <Input
          type="text"
          id="name"
          placeholder={translations.register.name.placeholder}
          autoFocus
          autoComplete="name"
          {...register("name")}
        />
        {errors.name && (
          <span className="text-destructive text-xs">{errors.name.message}</span>
        )}
      </Label>
      <Label htmlFor="email" className="grid gap-2">
        <span>{translations.register.email.label}</span>
        <Input
          type="email"
          id="email"
          placeholder={translations.register.email.placeholder}
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-destructive text-xs">{errors.email.message}</span>
        )}
      </Label>
      <Label htmlFor="password" className="grid gap-2">
        <span>{translations.register.password}</span>
        <Input
          type="password"
          id="password"
          placeholder="****************"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-destructive text-xs">{errors.password.message}</span>
        )}
      </Label>
      <TurnstileComponent turnstileRef={turnstileRef} setValue={setTurnstileValue} />
      <div className="text-xs text-muted-foreground">
        {translations.register.privacyPolicy.text}{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          className="text-primary hover:underline inline-flex items-center relative"
          rel="noopener"
        >
          <span>{translations.register.privacyPolicy.link}</span>
          <ExternalLink size={10} className="ml-1 relative -top-px" />
        </a>
      </div>
      <PendingSubmitButton isPending={isLoading} text={translations.register.signUp} />
    </form>
  );
}
