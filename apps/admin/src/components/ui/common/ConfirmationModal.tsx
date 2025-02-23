import { FaX, FaExclamation } from "react-icons/fa6";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  headerText?: string;
}
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  headerText,
}: ConfirmationModalProps) => {
  return (
    <dialog
      className={`fixed inset-0 z-[51] w-screen h-screen flex items-center justify-center 
        bg-black bg-opacity-70 backdrop-blur-sm 
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        transition-all duration-300 ease-in-out`}
    >
      <div
        className={`bg-zinc-900 border border-zinc-800 text-white 
          rounded-2xl shadow-2xl max-w-lg w-full p-8 
          transform transition-all duration-300 
          ${isOpen ? "scale-100" : "scale-90"}
          relative overflow-hidden`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white 
            transition-colors duration-200 p-2 rounded-full 
            hover:bg-zinc-800"
        >
          <FaX className="w-6 h-4" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-4">
            <FaExclamation className="w-12 h-12 text-red-500 stroke-2" />
            <h2 className="text-2xl font-bold text-zinc-100">
              {headerText || "Confirm Action"}
            </h2>
          </div>

          <p
            className="text-zinc-300 bg-zinc-800 border border-zinc-700 
            rounded-xl p-4 text-base leading-relaxed"
          >
            {message}
          </p>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 text-zinc-300 
                hover:bg-zinc-800 rounded-xl 
                transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-600 text-white 
                font-semibold rounded-xl 
                hover:bg-red-700 
                transition-colors duration-200 
                focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmationModal;
