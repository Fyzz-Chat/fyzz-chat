"use client";

import PendingSubmitButton from "@/components/auth/pending-submit-button";
import TurnstileComponent from "@/components/turnstile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { signInUser } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import { type FormState, initialState } from "@/lib/utils";
import { type LoginFormData, loginSchema } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInUser, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const router = useRouter();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      "cf-turnstile-response": "",
    },
  });

  const toastCallback = (state: FormState) => {
    if (state.success) {
      localStorage.setItem("fyzz-auth-method", "password");
      router.push(publicConf.redirectPath);
    }
  };

  useToast(state, toastCallback);

  async function onSubmit(data: LoginFormData) {
    startTransition(() => {
      formAction(data);
    });
  }

  function setTurnstileValue(token: string) {
    setValue("cf-turnstile-response", token);
  }

  const isLoading = isPending || isSubmitting || isTransitionPending;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Label htmlFor="email" className="grid gap-2">
        <span>{translations.login.email.label}</span>
        <Input
          type="email"
          id="email"
          placeholder={translations.login.email.placeholder}
          autoFocus
          {...register("email")}
        />
        {errors.email && (
          <span className="text-destructive text-xs">{errors.email.message}</span>
        )}
      </Label>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{translations.login.password}</Label>
          <Link
            href="/reset-password/request"
            className="text-xs text-primary hover:underline underline-offset-4"
          >
            {translations.login.forgotPassword}
          </Link>
        </div>
        <Input
          type="password"
          id="password"
          placeholder="****************"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-destructive text-xs">{errors.password.message}</span>
        )}
      </div>
      <TurnstileComponent setValue={setTurnstileValue} />
      <PendingSubmitButton isPending={isLoading} text={translations.login.signIn} />
    </form>
  );
}
