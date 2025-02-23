"use client";
import { FormEvent, useRef, useState } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { addNewCategory } from "@/actions/categoryActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { BlogCategory } from "@/types/blogTypes";
import { mutate } from "swr";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddCategory() {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{
    categoryName: string;
    description: string;
  }>({
    categoryName: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { addNotification } = useNotification();

  const resetForm = () => {
    setNewCategory({
      categoryName: "",
      description: "",
    });
  };

  const handleCategorySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!newCategory.categoryName) {
        inputRef.current?.focus();
        return addNotification({ message: "Category name is required" });
      }
      if (!newCategory.description) {
        textAreaRef.current?.focus();
        return addNotification({ message: "Category description is required" });
      }
      const response = await addNewCategory(newCategory);
      mutate(`/api/local/categories`, (current: BlogCategory[] | undefined) => {
        if (!current) return current;
        return [newCategory, ...current];
      });
      resetForm();
      setOpen(false);

      if (response.status === "success") {
        addNotification({
          message: "New category created",
          type: NotificationType.SUCCESS,
        });
      }
    } catch (error) {
      addNotification({ message: "Failed to add category" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" /> New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Add New Category
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new category for your blog posts.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleCategorySubmit}
          className="space-y-6 py-4"
          autoComplete="on"
        >
          <div className="space-y-2">
            <Label htmlFor="categoryName" className="text-gray-200">
              Category Name
            </Label>
            <Input
              id="categoryName"
              ref={inputRef}
              value={newCategory.categoryName}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  categoryName: e.target.value,
                }))
              }
              className="bg-neutral-800 border-neutral-700 text-white focus:ring-offset-neutral-900"
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">
              Category Description
            </Label>
            <Textarea
              id="description"
              ref={textAreaRef}
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="bg-neutral-800 border-neutral-700 text-white focus:ring-offset-neutral-900 min-h-[120px]"
              placeholder="Enter category description"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-gray-700 text-gray-200 hover:bg-neutral-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Create Category
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
