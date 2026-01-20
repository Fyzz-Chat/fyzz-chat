"use client";

import { use } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/contexts/translations-context";
import type { LoginFormData, RegisterFormData } from "@/types/auth";

type FormData = LoginFormData | RegisterFormData;

export default function EmailField<T extends FormData>({
  register,
  errors,
}: {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  return (
    <Label htmlFor="email" className="grid gap-2">
      <span>{translations.auth.email.label}</span>
      <Input
        type="email"
        id="email"
        placeholder={translations.auth.email.placeholder}
        autoComplete="email"
        autoFocus
        {...register("email" as never)}
      />
      {errors.email?.message && (
        <span className="text-destructive text-xs">{errors.email.message as string}</span>
      )}
    </Label>
  );
}
