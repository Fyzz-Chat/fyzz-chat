"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { use, useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import EmailField from "@/components/auth/email-field";
import PasswordField from "@/components/auth/password-field";
import PendingSubmitButton from "@/components/auth/pending-submit-button";
import { signInUser } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import { initialState } from "@/lib/utils";
import { type LoginFormData, loginSchema } from "@/types/auth";

export default function LoginForm() {
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
    },
  });

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("auth_email");
    if (storedEmail) {
      setValue("email", storedEmail);
    }
  }, [setValue]);

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
      sessionStorage.removeItem("auth_email");
      queryClient.clear();
      globalThis.location.href = publicConf.redirectPath;
    } else {
      setError("email", { message: state.description });
    }
  }, [state, queryClient, setError]);

  function onSubmit(data: LoginFormData) {
    startTransition(() => {
      formAction(data);
    });
  }

  const isLoading = isPending || isSubmitting || isTransitionPending;

  return (
    <form className="grid w-[300px] gap-6" onSubmit={handleSubmit(onSubmit)}>
      <EmailField register={register} errors={errors} autoFocus />
      <PasswordField register={register} errors={errors} showForgotPassword />
      <PendingSubmitButton isPending={isLoading} text={translations.login.signIn} />
    </form>
  );
}
