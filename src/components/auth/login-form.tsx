"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useToast from "@/hooks/use-toast";
import { signInUser } from "@/lib/actions/users";
import publicConf from "@/lib/public-config";
import { type FormState, initialState } from "@/lib/utils";
import { useInputStore } from "@/stores/input-store";
import { useActionState } from "react";
import PendingSubmitButton from "./pending-submit-button";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInUser, initialState);
  const { input } = useInputStore();

  const toastCallback = (state: FormState) => {
    if (state.message === "Signed in successfully") {
      localStorage.setItem("fyzz-auth-method", "password");

      if (input) {
        localStorage.setItem("fyzz-input-content", input);
      }

      window.location.href = publicConf.redirectPath;
    }
  };

  useToast(state, toastCallback);

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <Label htmlFor="email" className="space-y-1">
        <span>Email</span>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="johndoe@example.com"
          required
          autoFocus
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
      <PendingSubmitButton isPending={isPending} text="Sign in" className="mt-[18px]" />
    </form>
  );
}
