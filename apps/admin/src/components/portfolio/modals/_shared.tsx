"use client";

import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";


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

type PortfolioModalFrameProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  size?: PortfolioModalSize;
  children: React.ReactNode;
  footer: React.ReactNode | ((close: () => void) => React.ReactNode);
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
      open={!!open}
      onOpenChange={onOpenChange ?? (() => {})}
      trigger={trigger as React.ReactElement | null}
      title={title}
      description={description}
      size={size}
      footer={footer}
    >
      <div className="space-y-5">
        {children}
      </div>
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
  close?: () => void;
};

export function PortfolioModalActions({
  onSubmit,
  submitDisabled,
  submitLabel,
  updateLabel,
  isUpdating,
  submitIcon,
  close,
}: PortfolioModalActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={close}>Cancel</Button>
      <Button 
        variant="primary" 
        onClick={() => {
          onSubmit();
          close?.();
        }} 
        disabled={submitDisabled}
        iconLeft={submitIcon}
      >
        {isUpdating ? updateLabel : submitLabel}
      </Button>
    </div>
  );
}

