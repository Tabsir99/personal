import useUIStore from "@/stores/UIStore";
import { Button } from "premium-ds/button";
import {
  PencilSimple,
  Trash,
  Check,
  X,
  ArrowDown,
  ArrowUp,
  Power,
  ToggleLeft,
} from "@phosphor-icons/react";

interface ActionButton {
  icon?: React.ComponentType<{ className?: string | undefined }>;
  onClick: () => void;
  variant?:
    | "edit"
    | "delete"
    | "save"
    | "cancel"
    | "custom"
    | "moveUp"
    | "moveDown"
    | "toggle";
  customClassName?: string;
  disabled?: boolean;
  active?: boolean;
}

interface ActionButtonGroupProps {
  buttons: ActionButton[];
  entityName?: string;
}

export function ActionButtonGroup({
  buttons,
  entityName,
}: ActionButtonGroupProps) {
  const defaultIcons = {
    edit: PencilSimple,
    delete: Trash,
    save: Check,
    cancel: X,
    moveUp: ArrowUp,
    moveDown: ArrowDown,
  };

  const openModal = useUIStore.getState().openModal;

  return (
    <div className="absolute top-0 right-0 z-10 translate-x-2 opacity-0 transition-all duration-300 group-hover/card:translate-x-0 group-hover/card:opacity-100">
      <div className="flex items-center overflow-hidden rounded-bl-xl border border-border/60 bg-background/60 backdrop-blur-sm shadow-lg">
      {buttons.map((button, idx) => {
        const Icon =
          button.icon ||
          (button.variant === "toggle"
            ? button.active
              ? ToggleLeft
              : Power
            : null) ||
          (button.variant && button.variant !== "custom"
            ? defaultIcons[button.variant]
            : undefined);

        return (
          <Button
            key={idx}
            variant={button.variant === "delete" ? "danger" : "ghost"}
            size="icon"
            className={`rounded-none ${button.customClassName || ""}`}
            onClick={() => {
              if (button.variant === "delete") {
                return openModal("confirmation", {
                  data: {
                    headerText: `Delete ${entityName}`,
                    message: `Are you sure you want to delete this ${entityName}?`,
                    onConfirm: button.onClick,
                    confirmButtonText: "Delete",
                    confirmButtonVariant: "danger",
                    cancelButtonText: "Cancel",
                    cancelButtonVariant: "secondary",
                  },
                });
              }

              if (button.onClick) return button.onClick();
            }}
            disabled={button.disabled}
          >
            {Icon && <Icon className="size-4" />}
          </Button>
        );
      })}
      </div>
    </div>
  );
}
