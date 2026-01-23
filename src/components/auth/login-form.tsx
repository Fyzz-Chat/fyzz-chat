"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  use,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import EmailField from "@/components/auth/email-field";
import PendingSubmitButton from "@/components/auth/pending-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInUser } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import { type FormState, initialState } from "@/lib/utils";
import { type LoginFormData, loginSchema } from "@/types/auth";

export default function LoginForm() {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [state, formAction, isPending] = useActionState(signInUser, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      "cf-turnstile-response": "",
    },
  });

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("auth_email");
    if (storedEmail) {
      setValue("email", storedEmail);
    }
  }, [setValue]);

  const toastCallback = useCallback(
    (state: FormState) => {
      if (state.success) {
        sessionStorage.removeItem("auth_email");
        queryClient.clear();
        globalThis.location.href = publicConf.redirectPath;
      } else {
        setValue("cf-turnstile-response", "");
        turnstileRef.current?.reset();
        setError("email", { message: state.description });
      }
    },
    [queryClient, setValue, setError]
  );

  useEffect(() => {
    toastCallback(state);
  }, [state, toastCallback]);

  async function onSubmit(data: LoginFormData) {
    startTransition(() => {
      formAction(data);
    });
  }

  const isLoading = isPending || isSubmitting || isTransitionPending;

  return (
    <form className="grid w-[300px] gap-6" onSubmit={handleSubmit(onSubmit)}>
      <EmailField register={register} errors={errors} autoFocus />
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{translations.login.password}</Label>
          <Link
            href="/reset-password/request"
            className="text-primary text-xs underline-offset-4 hover:underline"
            tabIndex={-1}
          >
            {translations.login.forgotPassword}
          </Link>
        </div>
        <Input
          type="password"
          id="password"
          placeholder="****************"
          autoComplete="current-password"
          {...register("password")}
          className="h-12 focus-visible:ring-1"
        />
        {errors.password && (
          <span className="text-destructive text-xs">{errors.password.message}</span>
        )}
      </div>
      <PendingSubmitButton isPending={isLoading} text={translations.login.signIn} />
    </form>
  );
}
