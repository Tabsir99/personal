import useUIStore from "@/stores/UIStore";
import { Button } from "./button";
import {
  Edit2,
  Trash2,
  Check,
  X,
  ArrowDown,
  ArrowUp,
  Power,
  PowerOff,
} from "lucide-react";

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
  const moveBtnClass =
    "hover:bg-primary/10 hover:border-primary/30 hover:text-primary";
  const variantStyles = {
    edit: "hover:bg-accent hover:text-accent-foreground",
    delete:
      "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
    save: "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
    cancel:
      "hover:bg-muted hover:text-foreground hover:border-border",
    moveUp: moveBtnClass,
    moveDown: moveBtnClass,
    toggle:
      "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
  };

  const defaultIcons = {
    edit: Edit2,
    delete: Trash2,
    save: Check,
    cancel: X,
    moveUp: ArrowUp,
    moveDown: ArrowDown,
  };

  const openModal = useUIStore.getState().openModal;

  return (
    <div className="absolute top-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
      {buttons.map((button, idx) => {
        const Icon =
          button.icon ||
          (button.variant === "toggle"
            ? button.active
              ? PowerOff
              : Power
            : null) ||
          (button.variant && button.variant !== "custom"
            ? defaultIcons[button.variant]
            : undefined);

        const baseClass = `h-9 w-9 rounded-none ${idx === buttons.length - 1 ? "rounded-tr-xl" : ""} ${idx === 0 ? "rounded-bl-xl" : ""} ${idx === buttons.length - 1 ? "rounded-br-none" : ""} border border-border/60 bg-background/60 text-muted-foreground backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-border hover:text-foreground`;
        const variantClass =
          button.variant && button.variant !== "custom"
            ? variantStyles[button.variant]
            : button.customClassName || "";

        return (
          <Button
            key={idx}
            size="icon"
            className={`${baseClass} ${variantClass}`}
            onClick={() => {
              if (button.variant === "delete") {
                return openModal("confirmation", {
                  data: {
                    headerText: `Delete ${entityName}`,
                    message: `Are you sure you want to delete this ${entityName}?`,
                    onConfirm: button.onClick,
                    confirmButtonText: "Delete",
                    confirmButtonVariant: "destructive",
                    cancelButtonText: "Cancel",
                    cancelButtonVariant: "outline",
                  },
                });
              }

              if (button.onClick) return button.onClick();
            }}
            disabled={button.disabled}
          >
            {Icon && <Icon className="h-4 w-4" />}
          </Button>
        );
      })}
    </div>
  );
}
