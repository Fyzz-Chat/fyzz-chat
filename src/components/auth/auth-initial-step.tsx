"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, use } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import EmailField from "@/components/auth/email-field";
import LastUsedIndicator from "@/components/auth/last-used-indicator";
import OAuthForm from "@/components/auth/oauth-form";
import { Button } from "@/components/ui/button";
import { userExists } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";

const emailSchema = z.object({
  email: z.email("Email is required"),
});

type EmailFormData = z.infer<typeof emailSchema>;

type AuthInitialStepProps = {
  hasGoogle?: boolean;
};

export default function AuthInitialStep({
  hasGoogle = false,
}: Readonly<AuthInitialStepProps>) {
  const router = useRouter();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    sessionStorage.setItem("auth_email", data.email);

    try {
      const existingUser = await userExists(data.email);

      if (existingUser) {
        router.push("/login");
      } else {
        router.push("/register");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="grid gap-6 py-5">
      {hasGoogle && (
        <Fragment>
          <div className="flex flex-col">
            <OAuthForm provider="google" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">
                {translations.auth.or}
              </span>
            </div>
          </div>
        </Fragment>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <EmailField register={register} errors={errors} />

        <Button type="submit" className="relative w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : (
            <span>Continue</span>
          )}
          <LastUsedIndicator provider="email" />
        </Button>
      </form>
    </div>
  );
}
