"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import OAuthForm from "@/components/auth/oauth-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.object({
  email: z.email("Email is required."),
});

type EmailFormData = z.infer<typeof emailSchema>;

type AuthInitialStepProps = {
  hasGoogle?: boolean;
};

export default function AuthInitialStep({
  hasGoogle = false,
}: Readonly<AuthInitialStepProps>) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = (data: EmailFormData) => {
    sessionStorage.setItem("auth_email", data.email);
    router.push("/login");
  };

  return (
    <div className="grid gap-6 py-5">
      {hasGoogle && (
        <div className="flex flex-col">
          <OAuthForm provider="google" />
        </div>
      )}

      {hasGoogle && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">or</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Continuing..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}
