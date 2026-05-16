import { useState } from "react";
import { Plus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FormField } from "@/components/ui/FormField";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";

import { ModalSection } from "./_shared";

interface SkillCategoryDialogProps {
  children: React.ReactNode;
}

const defaultFormData: PageData["skills"][number] = {
  title: "",
  icon: "",
  skills: [],
  isActive: true,
};

export default function SkillCategoryDialog({
  children,
}: SkillCategoryDialogProps) {
  const [formData, setFormData] = useState(defaultFormData);
  const skillCategory = usePortfolioStore().skills;

  const handleSubmit = () => {
    skillCategory.add(formData);
    setFormData(defaultFormData);
  };

  return (
    <Dialog>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="max-w-md pb-0">
        <DialogHeader>
          <Eyebrow tone="muted" family="mono">
            New category
          </Eyebrow>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Add skill category
          </DialogTitle>
          <DialogDescription>
            Group related skills under a single icon header.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ModalSection eyebrow="Basics">
            <FormField label="Title">
              <Input
                placeholder="Frontend development"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </FormField>
          </ModalSection>

          <ModalSection eyebrow="Media">
            <FormField
              label="Icon URL"
              hint="Use a small image (PNG / SVG) to represent this category."
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
        </div>

        <DialogFooter className="sticky bottom-0 bg-inherit">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose
            render={
              <Button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.icon}
              >
                <Plus className="h-3.5 w-3.5" />
                Add category
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
