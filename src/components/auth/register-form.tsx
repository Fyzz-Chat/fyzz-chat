"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { useTranslations } from "@/lib/contexts/translations-context";
import publicConf from "@/lib/public-config";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, use, useTransition } from "react";
import { toast } from "sonner";
import PendingSubmitButton from "./pending-submit-button";

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      await signUp.email(
        {
          name,
          email,
          password,
          callbackURL: publicConf.redirectPath,
        },
        {
          onSuccess: () => {
            localStorage.setItem("fyzz-auth-method", "password");
            router.push("/chat");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Label htmlFor="name" className="space-y-1">
        <span>{translations.register.name.label}</span>
        <Input
          type="text"
          id="name"
          name="name"
          placeholder={translations.register.name.placeholder}
          required
          autoFocus
        />
      </Label>
      <Label htmlFor="email" className="space-y-1">
        <span>{translations.register.email.label}</span>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder={translations.register.email.placeholder}
          required
        />
      </Label>
      <Label htmlFor="password" className="space-y-1">
        <span>{translations.register.password}</span>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="****************"
          required
        />
      </Label>
      <div className="text-xs text-muted-foreground mt-2">
        {translations.register.privacyPolicy.text}{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          className="text-primary hover:underline inline-flex items-center relative"
        >
          <span>{translations.register.privacyPolicy.link}</span>
          <ExternalLink size={10} className="ml-1 relative -top-px" />
        </a>
      </div>
      <PendingSubmitButton
        isPending={isPending}
        text={translations.register.signUp}
        className="mt-[18px]"
      />
    </form>
  );
}
