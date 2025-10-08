import { KeyHandler } from "@/components/key-handler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHelpDialogStore } from "@/stores/help-dialog-store";

export function HelpDialog() {
  const helpOpen = useHelpDialogStore((state) => state.helpOpen);
  const setHelpOpen = useHelpDialogStore((state) => state.setHelpOpen);

  function handler() {
    setHelpOpen(true);
  }

  return (
    <>
      <KeyHandler keyString="?" handler={handler} />
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
