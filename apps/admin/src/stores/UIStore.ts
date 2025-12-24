import { create } from "zustand";
import { ButtonVariant } from "@/components/ui/button";

interface ConfirmationConfig {
  message: string;
  headerText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: ButtonVariant;
  cancelButtonVariant?: ButtonVariant;
}

interface ModalStates {
  confirmation: {
    isOpen: boolean;
    data: ConfirmationConfig | null;
  };
  blogThumbnail: {
    isOpen: boolean;
    data: { blogId: string; thumbnailUrl: string | undefined } | null;
  };
  blogShare: {
    isOpen: boolean;
    data: { url: string; title?: string } | null;
  };
}
type ModalData<T extends { isOpen: boolean }> = Omit<T, "isOpen">;

interface UIStore {
  modals: ModalStates;

  openModal: <K extends keyof ModalStates>(
    modalName: K,
    data: ModalData<ModalStates[K]>
  ) => void;

  closeModal: (modalName: keyof ModalStates) => void;

  closeAllModals: () => void;
}

const useUIStore = create<UIStore>((set) => ({
  modals: {
    confirmation: {
      isOpen: false,
      data: null,
    },
    blogThumbnail: {
      isOpen: false,
      data: null,
    },
    blogShare: {
      isOpen: false,
      data: null,
    },
  },

  openModal: (modalName, data) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: {
          isOpen: true,
          ...data,
        },
      },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: {
          ...state.modals[modalName],
          isOpen: false,
        },
      },
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: Object.fromEntries(
        Object.entries(state.modals).map(([key, value]) => [
          key,
          { ...value, isOpen: false },
        ])
      ) as ModalStates,
    })),
}));

export default useUIStore;
