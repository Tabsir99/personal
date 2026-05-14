import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/stores/PortfolioStore";
import { PageData } from "@tabsircg/schemas/portfolio";
import { Plus } from "lucide-react";

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
          <DialogTitle className="text-2xl">Add Skill Category</DialogTitle>
          <DialogDescription>
            Create a new category for your skills
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Basics
            </h3>

            <div>
              <Label className="mb-2 block">Title</Label>
              <Input
                placeholder="Frontend Development"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
          </div>

          {/* Media */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Media
            </h3>

            <div>
              <Label className="mb-2 block">Icon (Image URL)</Label>
              <Input
                placeholder="https://example.com/icon.png"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use an image URL to represent this category
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-inherit">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <DialogClose
            render={
              <Button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.icon}
              >
                <Plus /> Add Category
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
