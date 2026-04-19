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
import { PageData } from "@/types/portfolioTypes";
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
      <DialogContent className="max-w-md bg-zinc-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Skill Category</DialogTitle>
          <DialogDescription>
            Create a new category for your skills
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="mb-2 block">Category Title</Label>
            <Input
              placeholder="Frontend Development"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="mb-2 block">Icon (Image URL)</Label>
            <Input
              placeholder="https://example.com/icon.png"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="text-2xl"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use an image URL to represent this category
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
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
