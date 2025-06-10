"use client";

import { Button } from "@/components/ui/button";
import useToast from "@/hooks/use-toast";
import { deleteUser } from "@/lib/actions/users";
import { type FormState, initialState } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useActionState } from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";

export default function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteUser, initialState);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === "delete my account";

  function handleOpenChange(open: boolean) {
    setOpen(open);
    if (!open) {
      setConfirmText("");
    }
  }

  const successCallback = async (state: FormState) => {
    if (state.message === "User deleted") {
      setOpen(false);
      setTimeout(() => {
        signOut();
      }, 2000);
    }
  };

  useToast(state, successCallback);

  return (
    <div className="flex flex-col gap-2 p-4 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg">
      <h4 className="text-lg font-semibold">Delete Account</h4>
      <p className="text-sm">
        If you no longer wish to use this service, you can request account deletion. This
        action requires additional confirmation steps.
      </p>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" className="w-fit mt-2 self-end">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-left">
              Confirm Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <span className="text-red-600 dark:text-red-400 font-medium block">
                Warning: This action cannot be undone.
              </span>
              <span className="mt-4 block">
                <span className="text-sm font-medium mb-2 block">
                  For security, please type "delete my account" to proceed:
                </span>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                />
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-2 justify-end items-center">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <form action={formAction}>
              <Button type="submit" variant="destructive" disabled={!isConfirmed}>
                Delete Account
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
