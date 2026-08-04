import { useAtomAccessor } from "../../../../lib/reatom";
import { $alertDialog } from "./model";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { createEffect, createSignal } from "solid-js";
import { Button } from "../../../ui/button";

export const AlertDialog = () => {
  const rawData = useAtomAccessor($alertDialog.data);
  const [cachedData, setCachedData] = createSignal(rawData());

  createEffect(() => {
    const next = rawData();
    if (next) setCachedData(next);
  });

  const displayData = () => rawData() ?? cachedData();
  const isOpen = () => !!rawData();

  const handleConfirm = () => {
    rawData()?.resolve(true);
  };

  const handleCancel = () => {
    rawData()?.resolve(false);
  };

  return (
    <Dialog open={isOpen()} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{displayData()?.title}</DialogTitle>
          <DialogDescription>{displayData()?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div class="flex items-center *:w-full gap-1 justify-between">
            <Button onClick={handleConfirm}>
              {displayData()?.confirmLabel ?? "Confirm"}
            </Button>
            <Button onClick={handleCancel}>
              {displayData()?.cancelLabel ?? "Cancel"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
