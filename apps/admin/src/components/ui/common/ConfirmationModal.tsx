"use client";

import { AlertTriangle } from "lucide-react";
import { useShallow } from "zustand/shallow";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useUIStore from "@/stores/UIStore";

const ConfirmationModal = () => {
  const { isOpen, data } = useUIStore(
    useShallow((state) => state.modals.confirmation),
  );
  const closeModal = useUIStore().closeAllModals;

  const isDestructive =
    (data?.confirmButtonVariant ?? "destructive") === "destructive";

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={
                isDestructive
                  ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/8 text-destructive"
                  : "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-warning/20 bg-warning/8 text-warning"
              }
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-base leading-snug font-semibold tracking-tight">
                {data?.headerText || "Are you sure?"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
          {data?.message}
        </DialogDescription>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant={data?.cancelButtonVariant || "outline"}
                className="min-w-24"
              >
                {data?.cancelButtonText || "Cancel"}
              </Button>
            }
          />
          <DialogClose
            render={
              <Button
                variant={data?.confirmButtonVariant || "destructive"}
                onClick={data?.onConfirm}
                className="min-w-24"
              >
                {data?.confirmButtonText || "Confirm"}
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
