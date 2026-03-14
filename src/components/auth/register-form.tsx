"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { use, useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import EmailField from "@/components/auth/email-field";
import NameField from "@/components/auth/name-field";
import PasswordField from "@/components/auth/password-field";
import PendingSubmitButton from "@/components/auth/pending-submit-button";
import { registerUser } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import { initialState } from "@/lib/utils";
import { type RegisterFormData, registerSchema } from "@/types/auth";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
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

  function onSubmit(data: RegisterFormData) {
    startTransition(() => {
      formAction(data);
    });
  }

  const isLoading = isPending || isSubmitting || isTransitionPending;

  return (
    <form className="grid w-[300px] gap-6" onSubmit={handleSubmit(onSubmit)}>
      <NameField register={register} errors={errors} autoFocus />
      <EmailField register={register} errors={errors} />
      <PasswordField register={register} errors={errors} />
      <div className="text-muted-foreground text-xs">
        {translations.register.privacyPolicy.text}{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          className="relative inline-flex items-center text-primary hover:underline"
          rel="noopener"
        >
          <span>{translations.register.privacyPolicy.link}</span>
          <ExternalLink size={10} className="relative -top-px ml-1" />
        </a>
      </div>
      <PendingSubmitButton isPending={isLoading} text={translations.register.signUp} />
    </form>
  );
}
