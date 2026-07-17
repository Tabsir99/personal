 
import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { Textarea } from "premium-ds/textarea";
import { Button } from "premium-ds/button";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";

import { Dialog } from "premium-ds/dialog";

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
  open,
  onOpenChange,
  serviceIndex,
}: ServiceDialogProps) {
  const [formData, setFormData] = useState(existingService || defaultFormData);
  const [newItem, setNewItem] = useState("");
  const services = usePortfolioStore().services;

  const isUpdating =
    existingService !== undefined && typeof serviceIndex === "number";

  // Synchronously adjust state during render when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevService, setPrevService] = useState(existingService);

  if (open !== prevOpen || existingService !== prevService) {
    setPrevOpen(open);
    setPrevService(existingService);
    if (open) {
      setFormData(existingService || defaultFormData);
      setNewItem("");
    }
  }

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
    onOpenChange?.(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange?.(nextOpen);
        if (nextOpen) {
          setFormData(existingService || defaultFormData);
          setNewItem("");
        }
      }}
      trigger={children as React.ReactElement}
      size="md"
      title={isUpdating ? formData.title || "Edit service" : "Add service"}
      description="A framed offering shown on the portfolio landing page."
      footer={(close) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSubmit();
              close();
            }}
            disabled={!formData.title}
            iconLeft={<Plus size={14} />}
          >
            {isUpdating ? "Save changes" : "Add service"}
          </Button>
        </div>
      )}
    >
      <div className="space-y-5">
        <section title="Basics" className="space-y-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              id="service-label"
              label="Label"
              helper="Short eyebrow above the title."
              placeholder="Build"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
            <TextField
              id="service-title"
              label="Title"
              helper="Multi-line with \n."
              placeholder="Full-stack delivery"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <Textarea
            id="service-desc"
            label="Description"
            placeholder="What you do here, in one paragraph."
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            minRows={4}
          />
        </section>

        <section title="Frame" className="space-y-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <TextField
              id="service-frame-label"
              label="Frame label"
              placeholder="Full-stack delivery"
              value={formData.frameLabel}
              onChange={(e) =>
                setFormData({ ...formData, frameLabel: e.target.value })
              }
            />
            <TextField
              id="service-frame-title"
              label="Frame title"
              placeholder="Build"
              value={formData.frameTitle}
              onChange={(e) =>
                setFormData({ ...formData, frameTitle: e.target.value })
              }
            />
          </div>
        </section>

        <section title="Deliverables" className="space-y-6">
          {formData.items.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1.5">
              {formData.items.map((item, i) => (
                <li
                  key={i}
                  className="group/item flex items-center gap-2 rounded-md border border-foreground/6 bg-foreground/2 px-3 py-2"
                >
                  <span className="flex-1 text-sm">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(i)}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 hover:bg-destructive/8 hover:text-destructive focus-visible:opacity-100"
                    aria-label={`Remove ${item}`}
                    iconLeft={<X size={14} />}
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <TextField
              id="service-new-deliverable"
              placeholder="Add a deliverable…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              iconLeft={<Plus size={14} />}
              variant="secondary"
            >
              Add
            </Button>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
