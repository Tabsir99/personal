import { useEffect, useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";

import {
  ModalSection,
  PortfolioModalActions,
  PortfolioModalFrame,
} from "./_shared";

interface SkillCategoryDialogProps {
  children?: React.ReactNode;
  category?: PageData["skills"][number];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  categoryIndex?: number | null;
}

const defaultFormData: PageData["skills"][number] = {
  title: "",
  skills: [],
  isActive: true,
  order: 0,
};

export default function SkillCategoryDialog({
  children,
  category: existingCategory,
  open: controlledOpen,
  onOpenChange,
  categoryIndex,
}: SkillCategoryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const skillCategory = usePortfolioStore().skills;

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  const isUpdating =
    existingCategory !== undefined && typeof categoryIndex === "number";

  useEffect(() => {
    if (existingCategory && typeof categoryIndex === "number") {
      setFormData(existingCategory);
    } else if (!open) {
      setFormData(defaultFormData);
    }
  }, [existingCategory, categoryIndex, open]);

  const handleSubmit = () => {
    if (isUpdating) {
      skillCategory.update(categoryIndex!, {
        ...formData,
        skills: existingCategory?.skills ?? formData.skills,
      });
    } else {
      skillCategory.add(formData);
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
        isUpdating
          ? formData.title || "Edit category"
          : "Add skill category"
      }
      description="Group related skills under a single header."
      footer={(close) => (
        <PortfolioModalActions
          onSubmit={handleSubmit}
          submitDisabled={!formData.title}
          submitLabel="Add category"
          updateLabel="Save changes"
          isUpdating={isUpdating}
          submitIcon={<Plus size={14} />}
          close={close}
        />
      )}
    >
      <ModalSection title="Basics">
        <TextField
          id="skill-category-title"
          label="Title"
          placeholder="Front-end"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
      </ModalSection>
    </PortfolioModalFrame>
  );
}

