"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/contexts/translations-context";
import { cn } from "@/lib/utils";
import type {
  LoginFormData,
  RegisterFormData,
  UpdatePasswordFormData,
} from "@/types/auth";

type FormData = LoginFormData | RegisterFormData | UpdatePasswordFormData;

type PasswordFieldProps<T extends FormData> = Readonly<{
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  fieldName?: "password" | "currentPassword" | "newPassword" | "confirmPassword";
  showForgotPassword?: boolean;
  autoFocus?: boolean;
  autoComplete?: "current-password" | "new-password";
  label?: string;
}>;

export default function PasswordField<T extends FormData>({
  register,
  errors,
  fieldName = "password",
  showForgotPassword = false,
  autoFocus = false,
  autoComplete = "current-password",
  label,
}: PasswordFieldProps<T>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  const fieldError = errors[fieldName as keyof FieldErrors<T>];
  const displayLabel = label || translations.login.password;

  return (
    <Label htmlFor={fieldName} className="grid gap-2">
      <div className="flex items-center justify-between">
        <span>{displayLabel}</span>
        {showForgotPassword && (
          <Link
            href="/reset-password/request"
            className="text-primary text-xs underline-offset-4 hover:underline"
            tabIndex={-1}
          >
            {translations.login.forgotPassword}
          </Link>
        )}
      </div>
      <Input
        type="password"
        id={fieldName}
        placeholder="****************"
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        {...register(fieldName as never)}
        className={cn(
          "h-12 focus-visible:ring-1",
          fieldError?.message && "ring-1 ring-destructive"
        )}
      />
      {fieldError?.message && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="size-3" />
          <span className="text-xs">{fieldError.message as string}</span>
        </div>
      )}
    </Label>
  );
}
