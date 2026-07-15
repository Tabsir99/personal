/* eslint-disable react-hooks/set-state-in-effect */
import { useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { TextField } from "premium-ds/text-field";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";

import { Dialog } from "premium-ds/dialog";
import { Button } from "premium-ds/button";

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
  open,
  onOpenChange,
  categoryIndex,
}: SkillCategoryDialogProps) {
  const [formData, setFormData] = useState(existingCategory || defaultFormData);
  const skillCategory = usePortfolioStore().skills;

  const isUpdating =
    existingCategory !== undefined && typeof categoryIndex === "number";

  const resetKey = open ? (categoryIndex ?? "new") : null;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (open) setFormData(existingCategory || defaultFormData);
  }

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
    onOpenChange?.(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange?.(nextOpen);
        if (nextOpen) {
          setFormData(existingCategory || defaultFormData);
        }
      }}
      trigger={children as React.ReactElement | null}
      size="sm"
      title={
        isUpdating ? formData.title || "Edit category" : "Add skill category"
      }
      description="Group related skills under a single header."
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
            {isUpdating ? "Save changes" : "Add category"}
          </Button>
        </div>
      )}
    >
      <div className="space-y-5">
        <section title="Basics" className="space-y-6">
          <TextField
            id="skill-category-title"
            label="Title"
            placeholder="Front-end"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </section>
      </div>
    </Dialog>
  );
}
