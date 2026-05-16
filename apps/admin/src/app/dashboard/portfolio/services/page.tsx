"use client";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import Img from "@/components/ui/image";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";

import { usePortfolioStore } from "@/stores/PortfolioStore";
import { ModalSection } from "@/components/portfolio/modals/_shared";

interface ServiceDraft {
  title: string;
  content: string;
  icon: string;
  isActive: boolean;
}

const EMPTY_DRAFT: ServiceDraft = {
  title: "",
  content: "",
  icon: "",
  isActive: true,
};

export default function Services() {
  const services = usePortfolioStore(
    useShallow((state) => state.pageData.services),
  );
  const service = usePortfolioStore().services;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ServiceDraft>(EMPTY_DRAFT);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm(services[index]);
  };

  const handleSaveEdit = (index: number) => {
    service.update(index, editForm);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(EMPTY_DRAFT);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <Eyebrow tone="muted" family="mono">
          Portfolio · services
        </Eyebrow>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight">
          Services
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The offerings shown on the portfolio landing page.
        </p>
      </header>

      <div className="stagger-cascade-tight grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((item, index) => {
          const isEditing = editingIndex === index;
          return (
            <div
              key={item.title + index}
              style={{ ["--stagger-index" as string]: index }}
            >
              <Card className="group/service relative tactile-lift">
                <ActionButtonGroup
                  buttons={
                    isEditing
                      ? [
                          { onClick: () => handleSaveEdit(index), variant: "save" as const },
                          { onClick: handleCancelEdit, variant: "cancel" as const },
                        ]
                      : [
                          { onClick: () => service.moveUp(index), variant: "moveUp", disabled: index === 0 },
                          { onClick: () => service.moveDown(index), variant: "moveDown", disabled: index === services.length - 1 },
                          { onClick: () => service.toggle(index, "isActive"), variant: "toggle", active: item.isActive },
                          { onClick: () => handleEdit(index), variant: "edit" },
                          { onClick: () => service.delete(index), variant: "delete" },
                        ]
                  }
                  entityName="service"
                />
                <CardContent className="p-6">
                  {!isEditing ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md border border-foreground/[0.06] bg-foreground/[0.02] p-2">
                          <Img
                            src={item.icon}
                            alt={item.title}
                            width={28}
                            height={28}
                          />
                        </div>
                        <h3 className="truncate text-base leading-snug font-semibold tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <FormField label="Icon URL">
                        <Input
                          value={editForm.icon}
                          onChange={(e) =>
                            setEditForm({ ...editForm, icon: e.target.value })
                          }
                          placeholder="https://…/icon.png"
                          className="font-mono text-xs"
                        />
                      </FormField>
                      <FormField label="Title">
                        <Input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Service title"
                        />
                      </FormField>
                      <FormField label="Description">
                        <Textarea
                          value={editForm.content}
                          onChange={(e) =>
                            setEditForm({ ...editForm, content: e.target.value })
                          }
                          placeholder="Short description of this service"
                          rows={4}
                        />
                      </FormField>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}

        <AddServiceModal />
      </div>
    </div>
  );
}

function AddServiceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [newService, setNewService] = useState<ServiceDraft>(EMPTY_DRAFT);
  const serviceHandler = usePortfolioStore().services;

  const handleAddService = () => {
    if (newService.title && newService.content && newService.icon) {
      serviceHandler.add(newService);
      setNewService(EMPTY_DRAFT);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <AddCard
            title="Add service"
            description="Add a new service to your portfolio"
            className="min-h-52"
          />
        }
      />
      <DialogContent className="sm:max-w-lg pb-0">
        <DialogHeader>
          <Eyebrow tone="muted" family="mono">
            New service
          </Eyebrow>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Add service
          </DialogTitle>
          <DialogDescription>
            A short offering shown on the portfolio landing page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ModalSection eyebrow="Basics">
            <FormField label="Title">
              <Input
                value={newService.title}
                onChange={(e) =>
                  setNewService({ ...newService, title: e.target.value })
                }
                placeholder="Full-stack application development"
              />
            </FormField>
            <FormField label="Description">
              <Textarea
                value={newService.content}
                onChange={(e) =>
                  setNewService({ ...newService, content: e.target.value })
                }
                placeholder="Building scalable, modern web applications…"
                rows={5}
              />
            </FormField>
          </ModalSection>

          <ModalSection eyebrow="Media">
            <FormField
              label="Icon URL"
              hint="Use a public URL pointing at a small PNG / SVG."
            >
              <Input
                value={newService.icon}
                onChange={(e) =>
                  setNewService({ ...newService, icon: e.target.value })
                }
                placeholder="https://…/icon.png"
                className="font-mono text-xs"
              />
            </FormField>
          </ModalSection>
        </div>

        <DialogFooter className="sticky bottom-0 bg-inherit">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleAddService}
            disabled={!newService.title || !newService.content || !newService.icon}
          >
            <Plus className="h-3.5 w-3.5" />
            Add service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
