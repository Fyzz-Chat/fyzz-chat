"use client";

import { AlertCircle } from "lucide-react";
import { use } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/contexts/translations-context";
import { cn } from "@/lib/utils";
import type {
  LoginFormData,
  RegisterFormData,
  RequestPasswordResetFormData,
} from "@/types/auth";

type FormData = LoginFormData | RegisterFormData | RequestPasswordResetFormData;

export default function EmailField<T extends FormData>({
  register,
  errors,
  autoFocus = false,
}: Readonly<{
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  autoFocus?: boolean;
}>) {
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
        autoFocus={autoFocus}
        {...register("email" as never)}
        className={cn(
          "h-12 focus-visible:ring-1",
          errors.email?.message && "ring-1 ring-destructive"
        )}
      />
      {errors.email?.message && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="size-3" />
          <span className="text-xs">{errors.email.message as string}</span>
        </div>
      )}
    </Label>
  );
}
