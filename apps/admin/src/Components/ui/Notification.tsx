import { NotificationType } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { MdErrorOutline, MdWarningAmber } from "react-icons/md";

interface NotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
}

const Notification = ({
  message,
  type = NotificationType.INFO,
  duration = 5000,
  onClose,
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const icons = {
    [NotificationType.SUCCESS]: (
      <AiOutlineCheckCircle className="text-green-400" />
    ),
    [NotificationType.ERROR]: <MdErrorOutline className="text-red-400" />,
    [NotificationType.WARNING]: <MdWarningAmber className="text-yellow-400" />,
    [NotificationType.INFO]: <AiOutlineInfoCircle className="text-blue-400" />,
  };

  const bgColors = {
    [NotificationType.SUCCESS]: "bg-green-900/80",
    [NotificationType.ERROR]: "bg-red-900/80",
    [NotificationType.WARNING]: "bg-yellow-900/80",
    [NotificationType.INFO]: "bg-blue-900/80",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`
          fixed top-4 right-4 z-50 
          flex items-center 
          ${bgColors[type]}
          backdrop-blur-md
          text-white 
          rounded-lg 
          shadow-2xl 
          p-4 
          space-x-3 
          transition-all 
          duration-200 
          ease-linear
          animate-slide-in
        `}
      style={{ animationDuration: "0.2s", animationTimingFunction: "linear" }}
    >
      {icons[type]}
      <div className="flex-grow">
        <p className="font-semibold text-sm">{message}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="hover:bg-white/20 rounded-full p-1 transition-colors"
      >
        <AiOutlineClose size={16} />
      </button>
    </div>
  );
};

export default Notification;
