import { create } from "zustand";

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  headerText: string;
  onConfirm: () => void;
  onCancel: () => void;

  confirmButtonText?: string;
  cancelButtonText?: string;

  confirmButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  cancelButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

interface UIStore {
  confirmation: ConfirmationState;
  showConfirmation: (config: Partial<ConfirmationState>) => void;
  hideConfirmation: () => void;
}

const useUIStore = create<UIStore>((set, get) => ({
  confirmation: {
    isOpen: false,
    message: "",
    headerText: "",
    onConfirm() {},
    onCancel() {},
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    confirmButtonVariant: "default",
    cancelButtonVariant: "outline",
  },

  showConfirmation: (config) =>
    set({
      confirmation: {
        isOpen: true,
        message: config.message || "Are you sure?",
        onConfirm: () => {
          config.onConfirm?.();
          get().hideConfirmation();
        },
        onCancel: () => {
          config.onCancel?.();
          get().hideConfirmation();
        },
        headerText: config.headerText || "Are you sure?",
        confirmButtonText: config.confirmButtonText || "Confirm",
        cancelButtonText: config.cancelButtonText || "Cancel",
        confirmButtonVariant: config.confirmButtonVariant || "default",
        cancelButtonVariant: config.cancelButtonVariant || "outline",
      },
    }),

  hideConfirmation: () =>
    set((state) => ({
      confirmation: {
        ...state.confirmation,
        isOpen: false,
      },
    })),
}));

export default useUIStore;
