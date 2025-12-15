import { use } from "react";
import { KeyHandler } from "@/components/key-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useTranslations } from "@/lib/contexts/translations-context";
import { useHelpDialogStore } from "@/stores/help-dialog-store";

export function HelpDialog() {
  const translationsPromise = useTranslations();
  const translations = use(translationsPromise);
  const helpOpen = useHelpDialogStore((state) => state.helpOpen);
  const setHelpOpen = useHelpDialogStore((state) => state.setHelpOpen);

  function handler() {
    setHelpOpen((helpOpen) => !helpOpen);
  }

  return (
    <>
      <KeyHandler keyString="?" handler={handler} />
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations.help.title}</DialogTitle>
            <DialogDescription>{translations.help.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {translations.help.shortcuts.map((shortcut) => (
              <div
                key={shortcut.description}
                className="flex items-center justify-between gap-2"
              >
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
                <span className="ml-auto text-sm">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
