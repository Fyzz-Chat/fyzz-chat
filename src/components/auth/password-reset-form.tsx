"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { type FormEvent, useTransition } from "react";
import { toast } from "sonner";

export default function PasswordResetForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      await resetPassword(
        {
          newPassword: password,
          token,
        },
        {
          onSuccess: () => {
            toast.success("Password reset successfully");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" name="password" />
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input type="password" id="confirm-password" name="confirm-password" />
      </div>
      <Button type="submit" className="self-end mt-4 px-5" disabled={isPending}>
        Reset Password
      </Button>
    </form>
  );
}
