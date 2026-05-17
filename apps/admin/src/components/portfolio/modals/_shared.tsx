"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ModalSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <section title={title} className="space-y-6">
      {children}
    </section>
  );
};

export type PortfolioModalSize = "sm" | "md" | "lg";

const modalSizeClass: Record<PortfolioModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-3xl",
};

type PortfolioModalFrameProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  size?: PortfolioModalSize;
  children: React.ReactNode;
  footer: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function PortfolioModalFrame({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  size = "md",
  children,
  footer,
}: PortfolioModalFrameProps) {
  return (
    <Dialog
      {...(open !== undefined && onOpenChange ? { open, onOpenChange } : {})}
    >
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0",
          modalSizeClass[size],
        )}
      >
        <DialogHeader className="shrink-0 border-b border-foreground/6 px-6 py-4">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
          {children}
        </div>

        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type PortfolioModalActionsProps = {
  onSubmit: () => void;
  submitDisabled?: boolean;
  submitLabel: React.ReactNode;
  updateLabel: React.ReactNode;
  isUpdating?: boolean;
  submitIcon?: React.ReactNode;
};

export function PortfolioModalActions({
  onSubmit,
  submitDisabled,
  submitLabel,
  updateLabel,
  isUpdating,
  submitIcon,
}: PortfolioModalActionsProps) {
  return (
    <>
      <DialogClose render={<Button variant="outline">Cancel</Button>} />
      <DialogClose
        render={
          <Button onClick={onSubmit} disabled={submitDisabled}>
            {isUpdating ? (
              updateLabel
            ) : (
              <>
                {submitIcon}
                {submitLabel}
              </>
            )}
          </Button>
        }
      />
    </>
  );
}
