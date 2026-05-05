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
    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center mb-4 pb-3 border-b border-border">
      <h1 className="font-bold text-2xl">{title}</h1>
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          disabled={actionButton.disabled || actionButton.isLoading}
          className="active:scale-95"
        >
          {actionButton.isLoading ? "Loading..." : actionButton.text}
        </Button>
      )}
    </div>
  );
};
