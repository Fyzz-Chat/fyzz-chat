"use client";

import { use, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import useToast from "@/hooks/use-toast";
import { deleteUser } from "@/lib/actions/users";
import { useTranslations } from "@/lib/contexts/translations-context";
import { type FormState, initialState } from "@/lib/utils";
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
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
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
    if (state.success) {
      setOpen(false);
      setTimeout(async () => {
        globalThis.location.reload();
      }, 1000);
    }
  };

  useToast(state, successCallback);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
      <h4 className="font-semibold text-lg">
        {translations.settings.account.deleteCard.title}
      </h4>
      <p className="text-sm">{translations.settings.account.deleteCard.description}</p>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" className="mt-2 w-fit self-end">
            {translations.settings.account.deleteButton}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="text-left">
              {translations.settings.account.dialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              <span className="block font-medium text-red-600 dark:text-red-400">
                {translations.settings.account.dialog.descriptionRed}
              </span>
              <span className="mt-4 block">
                <span className="mb-2 block font-medium text-sm">
                  {translations.settings.account.dialog.description}
                </span>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                />
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-end gap-2">
            <AlertDialogCancel className="mt-0">
              {translations.settings.account.dialog.cancelButton}
            </AlertDialogCancel>
            <form action={formAction}>
              <Button type="submit" variant="destructive" disabled={!isConfirmed}>
                {translations.settings.account.dialog.deleteButton}
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
