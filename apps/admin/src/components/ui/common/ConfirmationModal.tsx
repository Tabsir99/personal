"use client";

import { AlertTriangle, X } from "lucide-react";
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

const ConfirmationModal = () => {
  const { isOpen, message, onConfirm, headerText, onCancel, confirmButtonText, cancelButtonText, confirmButtonVariant, cancelButtonVariant   } = useUIStore(
    useShallow((state) => state.confirmation)
  );
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 p-0 gap-0 rounded-xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-0 space-y-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-zinc-50">
                  {headerText || "Confirm Action"}
                </DialogTitle>
              </div>
            </div>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-8 w-8 rounded-full text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 -mr-2 -mt-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="rounded-lg bg-zinc-950/5 border border-zinc-800 p-4">
            <DialogDescription className="text-zinc-300 text-base leading-relaxed m-0">
              {message}
            </DialogDescription>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-2 gap-3">
          <Button
            variant={cancelButtonVariant || "outline"}
            onClick={onCancel}
            className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 px-8"
          >
            {cancelButtonText || "Cancel"}
          </Button>
          <Button
            variant={confirmButtonVariant || "default"}
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500/50 px-8 font-medium"
          >
            {confirmButtonText || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
