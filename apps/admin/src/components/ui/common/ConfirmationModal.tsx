"use client";

import { AlertTriangle } from "lucide-react";
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
import { useShallow } from "zustand/shallow";
import { cn } from "@/lib/utils";

const ConfirmationModal = () => {
  const { isOpen, data } = useUIStore(
    useShallow((state) => state.modals.confirmation),
  );

  const closeModal = useUIStore().closeAllModals;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {data?.headerText || "Confirm Action"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <DialogDescription className="m-0 text-base leading-relaxed text-foreground">
              {data?.message}
            </DialogDescription>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant={data?.cancelButtonVariant || "outline"}
                className="w-24"
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
                className={cn("w-24")}
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
