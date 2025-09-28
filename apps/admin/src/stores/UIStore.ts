import { create } from "zustand";

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  headerText: string;
  onConfirm: () => void;
  onCancel: () => void;
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
