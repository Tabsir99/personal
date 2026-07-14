"use client";

import { Warning } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";
import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";
import useUIStore from "@/stores/UIStore";

const ConfirmationModal = () => {
  const { isOpen, data } = useUIStore(
    useShallow((state) => state.modals.confirmation),
  );
  const closeModal = useUIStore().closeAllModals;

  const isDestructive =
    (data?.confirmButtonVariant ?? "destructive") === "destructive";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      tone={isDestructive ? "danger" : "default"}
      icon={<Warning size={20} />}
      title={data?.headerText || "Are you sure?"}
      description={data?.message}
      footer={
        <div className="flex justify-end gap-2.5">
          <Button
            variant="secondary"
            onClick={closeModal}
            className="min-w-24"
          >
            {data?.cancelButtonText || "Cancel"}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={() => {
              data?.onConfirm();
              closeModal();
            }}
            className="min-w-24"
          >
            {data?.confirmButtonText || "Confirm"}
          </Button>
        </div>
      }
    />
  );
};

export default ConfirmationModal;
