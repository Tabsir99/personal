import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

type Service = PageData["services"][number];

const defaultFormData: Service = {
  label: "",
  title: "",
  desc: "",
  frameLabel: "",
  frameTitle: "",
  items: [],
  isActive: true,
  order: 0,
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
  const [newItem, setNewItem] = useState("");
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
      setNewItem("");
    }
  }, [existingService, serviceIndex, open]);

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    setFormData({ ...formData, items: [...formData.items, trimmed] });
    setNewItem("");
  };

  const handleRemoveItem = (i: number) =>
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== i),
    });

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
      size="md"
      title={isUpdating ? formData.title || "Edit service" : "Add service"}
      description="A framed offering shown on the portfolio landing page."
      footer={
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={!formData.title}
          submitLabel="Add service"
          updateLabel="Save changes"
          isUpdating={isUpdating}
          submitIcon={<Plus className="h-3.5 w-3.5" />}
        />
      }
    >
      <ModalSection title="Basics">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Label" hint="Short eyebrow above the title.">
            <Input
              placeholder="Build"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </FormField>
          <FormField label="Title" hint="Multi-line with \n.">
            <Input
              placeholder="Full-stack delivery"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea
            placeholder="What you do here, in one paragraph."
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            rows={4}
          />
        </FormField>
      </ModalSection>

      <ModalSection title="Frame">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Frame label">
            <Input
              placeholder="Full-stack delivery"
              value={formData.frameLabel}
              onChange={(e) =>
                setFormData({ ...formData, frameLabel: e.target.value })
              }
            />
          </FormField>
          <FormField label="Frame title">
            <Input
              placeholder="Build"
              value={formData.frameTitle}
              onChange={(e) =>
                setFormData({ ...formData, frameTitle: e.target.value })
              }
            />
          </FormField>
        </div>
      </ModalSection>

      <ModalSection title="Deliverables">
        {formData.items.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {formData.items.map((item, i) => (
              <li
                key={i}
                className="group/item flex items-center gap-2 rounded-md border border-foreground/6 bg-foreground/2 px-3 py-2"
              >
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveItem(i)}
                  className="text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/8 hover:text-destructive group-hover/item:opacity-100 focus-visible:opacity-100"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Add a deliverable…"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddItem}
            disabled={!newItem.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </ModalSection>
    </PortfolioModalFrame>
  );
}
