"use client";

import { AlertCircle } from "lucide-react";
import { use } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/lib/contexts/translations-context";
import { cn } from "@/lib/utils";
import type { RegisterFormData } from "@/types/auth";

export default function NameField({
  register,
  errors,
  autoFocus = false,
}: Readonly<{
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  autoFocus?: boolean;
}>) {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  return (
    <Label htmlFor="name" className="grid gap-2">
      <span>{translations.register.name.label}</span>
      <Input
        type="text"
        id="name"
        placeholder={translations.register.name.placeholder}
        autoComplete="name"
        autoFocus={autoFocus}
        {...register("name")}
        className={cn(
          "h-12 focus-visible:ring-1",
          errors.name?.message && "ring-1 ring-destructive"
        )}
      />
      {errors.name?.message && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="size-3" />
          <span className="text-xs">{errors.name.message}</span>
        </div>
      )}
    </Label>
  );
}
