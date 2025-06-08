"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { registerUser } from "@/lib/actions/users";
import publicConf from "@/lib/public-config";
import { type FormState, initialState } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useActionState } from "react";
import PendingSubmitButton from "./pending-submit-button";

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  const toastCallback = (state: FormState) => {
    if (state.message === "Registered successfully") {
      window.location.href = publicConf.redirectPath;
      localStorage.setItem("fyzz-auth-method", "password");
    }
  };

  useToast(state, toastCallback);

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Label htmlFor="name" className="space-y-1">
        <span>Name</span>
        <Input
          type="text"
          id="name"
          name="name"
          placeholder="John Doe"
          required
          autoFocus
        />
      </Label>
      <Label htmlFor="email" className="space-y-1">
        <span>Email</span>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="johndoe@example.com"
          required
        />
      </Label>
      <Label htmlFor="password" className="space-y-1">
        <span>Password</span>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="****************"
          required
        />
      </Label>
      <div className="text-xs text-muted-foreground mt-2">
        By signing up, you agree to our{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          className="text-primary hover:underline inline-flex items-center relative"
        >
          <span>Privacy Policy</span>
          <ExternalLink size={10} className="ml-1 relative top-[-1px]" />
        </a>
      </div>
      <PendingSubmitButton isPending={isPending} text="Sign up" className="mt-[18px]" />
    </form>
  );
}
