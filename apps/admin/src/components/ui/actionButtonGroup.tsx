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
    "bg-white/5 hover:bg-green-500/90 hover:border-green-400/50 hover:shadow-green-500/30";
  const variantStyles = {
    edit: "bg-white/5 hover:bg-blue-500/90 hover:border-blue-400/50 hover:shadow-blue-500/30",
    delete: "bg-white/5 hover:bg-red-500/90 hover:border-red-400/50",
    save: "bg-emerald-500/90 hover:bg-emerald-400 border-emerald-400/50 hover:border-emerald-300/50 hover:shadow-emerald-500/40",
    cancel:
      "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30",
    moveUp: moveBtnClass,
    moveDown: moveBtnClass,
    toggle:
      "bg-white/5 hover:bg-emerald-400 border-emerald-400/50 hover:border-emerald-300/50 hover:shadow-emerald-500/40",
  };

  const defaultIcons = {
    edit: Edit2,
    delete: Trash2,
    save: Check,
    cancel: X,
    moveUp: ArrowUp,
    moveDown: ArrowDown,
  };

  const showConfirmation = useUIStore.getState().showConfirmation;

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

        const baseClass = `h-9 w-9 rounded-none ${idx === buttons.length - 1 ? "rounded-tr-xl" : ""} ${idx === 0 ? "rounded-bl-xl" : ""} ${idx === buttons.length - 1 ? "rounded-br-none" : ""} backdrop-blur-sm text-white/60 hover:text-white shadow-lg border-white/10 transition-all duration-300`;
        const variantClass =
          button.variant && button.variant !== "custom"
            ? variantStyles[button.variant]
            : button.customClassName || "";

        return (
          <Button
            key={idx}
            size="icon"
            variant="ghost"
            className={`${baseClass} ${variantClass}`}
            onClick={() => {
              if (button.variant === "delete") {
                return showConfirmation({
                  headerText: `Delete ${entityName}`,
                  message: `Are you sure you want to delete this ${entityName}?`,
                  onConfirm: button.onClick,
                  confirmButtonText: "Delete",
                  confirmButtonVariant: "destructive",
                  cancelButtonText: "Cancel",
                  cancelButtonVariant: "outline",
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
