"use client";
import { Card, CardContent } from "@/components/ui/card";
import Img from "@/components/ui/image";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { useShallow } from "zustand/react/shallow";
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
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddCard } from "@/components/ui/add-card";
import { ActionButtonGroup } from "@/components/ui/actionButtonGroup";

export default function Services() {
  const services = usePortfolioStore(
    useShallow((state) => state.pageData.services),
  );
  const service = usePortfolioStore().services;

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    icon: "",
    isActive: true,
  });

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
    setEditForm({ title: "", content: "", icon: "", isActive: true });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Services</h2>
        <p className="text-muted-foreground">Manage your portfolio services</p>
      </div>

      <div className="grid grid-cols-3 gap-6 items-start">
        {services.map((item, index) => {
          const isEditing = editingIndex === index;

          return (
            <Card
              key={index}
              className="group relative min-h-52 w-full overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:border-border hover:bg-card"
            >
              {!isEditing ? (
                <ActionButtonGroup
                  buttons={[
                    {
                      onClick: () => service.moveUp(index),
                      variant: "moveUp",
                      disabled: index === 0,
                    },
                    {
                      onClick: () => service.moveDown(index),
                      variant: "moveDown",
                      disabled: index === services.length - 1,
                    },
                    {
                      onClick: () => service.toggle(index, "isActive"),
                      variant: "toggle",
                      active: item.isActive,
                    },
                    { onClick: () => handleEdit(index), variant: "edit" },
                    {
                      onClick: () => service.delete(index),
                      variant: "delete",
                    },
                  ]}
                  entityName="service"
                />
              ) : (
                <ActionButtonGroup
                  buttons={[
                    { onClick: () => handleSaveEdit(index), variant: "save" },
                    { onClick: handleCancelEdit, variant: "cancel" },
                  ]}
                />
              )}

              <CardContent className="p-8 overflow-hidden">
                {/* View Mode */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isEditing ? "0fr" : "1fr" }}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-muted/60 p-2 ring-1 ring-border/60 transition-all duration-300 group-hover:bg-muted group-hover:ring-border">
                        <Img
                          src={item.icon}
                          alt={item.title}
                          width={36}
                          height={36}
                        />
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Edit Mode */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isEditing ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                          Icon URL
                        </label>
                        <Input
                          value={editForm.icon}
                          onChange={(e) =>
                            setEditForm({ ...editForm, icon: e.target.value })
                          }
                          placeholder="https://example.com/icon.png"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                          Title
                        </label>
                        <Input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="Service title"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground/90">
                          Description
                        </label>
                        <Textarea
                          value={editForm.content}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              content: e.target.value,
                            })
                          }
                          placeholder="Service description"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-border to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Card>
          );
        })}

        <AddServiceModal />
      </div>
    </div>
  );
}

const AddServiceModal = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    title: "",
    content: "",
    icon: "",
    isActive: true,
  });
  const serviceHandler = usePortfolioStore().services;
  const handleAddService = () => {
    if (newService.title && newService.content && newService.icon) {
      serviceHandler.add(newService);
      setNewService({
        title: "",
        content: "",
        icon: "",
        isActive: true,
      });
      setIsAddDialogOpen(false);
    }
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger
        render={
          <AddCard
            title="Add Service"
            description="Add a new service to your portfolio"
            className="min-h-52"
          />
        }
      />
      <DialogContent className="sm:max-w-[550px] border border-border shadow-2xl backdrop-blur-xl pb-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Service
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new service to showcase on your portfolio
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Basics
            </h3>

            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                value={newService.title}
                onChange={(e) =>
                  setNewService({ ...newService, title: e.target.value })
                }
                placeholder="Full-Stack Application Development"
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={newService.content}
                onChange={(e) =>
                  setNewService({ ...newService, content: e.target.value })
                }
                placeholder="Building scalable, modern web applications..."
                rows={5}
              />
            </div>
          </div>

          {/* Media */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Media
            </h3>

            <div>
              <Label htmlFor="icon" className="mb-2 block">
                Icon URL
              </Label>
              <Input
                id="icon"
                value={newService.icon}
                onChange={(e) =>
                  setNewService({ ...newService, icon: e.target.value })
                }
                placeholder="https://example.com/icon.png"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a public URL to your service icon
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-inherit">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsAddDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleAddService}
            disabled={
              !newService.title || !newService.content || !newService.icon
            }
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
