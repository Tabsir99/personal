import { ReactNode } from "react";
import { Button } from "../button";

export const PageHeader = ({
  title,
  actionButton,
}: {
  title: string;
  actionButton?: {
    onClick: () => void;
    text: ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
  };
}) => {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center mb-4 pb-3 border-b border-zinc-800">
      <h1 className="font-bold text-2xl">{title}</h1>
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          disabled={actionButton.disabled || actionButton.isLoading}
          className="bg-blue-600 hover:bg-blue-600/90 active:scale-95 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          {actionButton.isLoading ? "Loading..." : actionButton.text}
        </Button>
      )}
    </div>
  );
};
