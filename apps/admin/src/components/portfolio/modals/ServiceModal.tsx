import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/FormField";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";

import {
  ModalSection,
  PortfolioModalActions,
  PortfolioModalFrame,
} from "./_shared";

interface ServiceDialogProps {
  children?: React.ReactNode;
  service?: PageData["services"][number];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  serviceIndex?: number | null;
}

const defaultFormData: PageData["services"][number] = {
  title: "",
  content: "",
  icon: "",
  isActive: true,
};

export default function ServiceDialog({
  children,
  service: existingService,
  open: controlledOpen,
  onOpenChange,
  serviceIndex,
}: ServiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const services = usePortfolioStore().services;

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  const isUpdating =
    existingService !== undefined && typeof serviceIndex === "number";

  useEffect(() => {
    if (existingService && typeof serviceIndex === "number") {
      setFormData(existingService);
    } else if (!open) {
      setFormData(defaultFormData);
    }
  }, [existingService, serviceIndex, open]);

  const handleSubmit = () => {
    if (isUpdating) {
      services.update(serviceIndex!, formData);
    } else {
      services.add(formData);
    }
    setFormData(defaultFormData);
    setOpen(false);
  };

  return (
    <PortfolioModalFrame
      open={open}
      onOpenChange={setOpen}
      {...(children ? { trigger: children } : {})}
      size="sm"
      title={
        isUpdating ? formData.title || "Edit service" : "Add service"
      }
      description="A short offering shown on the portfolio landing page."
      footer={
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={
            !formData.title || !formData.content || !formData.icon
          }
          submitLabel="Add service"
          updateLabel="Save changes"
          isUpdating={isUpdating}
          submitIcon={<Plus className="h-3.5 w-3.5" />}
        />
      }
    >
      <ModalSection title="Basics">
        <FormField label="Title">
          <Input
            placeholder="Full-stack application development"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </FormField>
        <FormField label="Description">
          <Textarea
            placeholder="Building scalable, modern web applications…"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={5}
          />
        </FormField>
      </ModalSection>

      <ModalSection title="Media">
        <FormField
          label="Icon URL"
          hint="Use a public URL pointing at a small PNG / SVG."
        >
          <Input
            placeholder="https://…/icon.png"
            value={formData.icon}
            onChange={(e) =>
              setFormData({ ...formData, icon: e.target.value })
            }
            className="font-mono text-xs"
          />
        </FormField>
      </ModalSection>
    </PortfolioModalFrame>
  );
}
