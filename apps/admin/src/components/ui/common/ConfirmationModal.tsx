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
        <DialogHeader className="p-6 pb-0 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-zinc-50">
                {data?.headerText || "Confirm Action"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="rounded-lg bg-zinc-950/5 border border-zinc-800 p-4">
            <DialogDescription className="text-zinc-300 text-base leading-relaxed m-0">
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
                className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 w-24"
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
