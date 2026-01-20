"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import EmailField from "@/components/auth/email-field";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import {
  type RequestPasswordResetFormData,
  requestPasswordResetSchema,
} from "@/types/auth";

export default function RequestPasswordResetForm() {
  const [isPending, setIsPending] = useState(false);
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: RequestPasswordResetFormData) {
    setIsPending(true);
    try {
      const result = await requestPasswordReset(data.email);
      if (result.success) {
        toast.success(result.message, {
          description: result.description,
        });
      } else {
        toast.error(result.message, {
          description: result.description,
        });
      }
    } finally {
      setIsPending(false);
    }
  }

  const isLoading = isPending || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <EmailField register={register} errors={errors} autoFocus />
      <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
        {translations.requestPasswordReset.submit}
      </Button>
      <div className="text-center">
        <Link
          href="/login"
          className="text-muted-foreground text-sm transition-colors hover:text-primary"
        >
          {translations.requestPasswordReset.backToLogin}
        </Link>
      </div>
    </form>
  );
}
