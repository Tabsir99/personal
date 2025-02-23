import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CategoryStatus } from "@/types/blogTypes";

// Define types for props
interface EditNameProps {
  status: CategoryStatus;
  toggleStatus: () => void;
  categoryName: string;
  description: string;
  setCurrentCategory: React.Dispatch<React.SetStateAction<Category>>;
  isEditing: boolean;
}

// Define types for the category and editing state
interface Category {
  categoryName: string;
  description: string;
  status: CategoryStatus;
}

export const EditName = ({
  status,
  toggleStatus,
  categoryName,
  description,
  setCurrentCategory,
  isEditing,
}: EditNameProps) => {
  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${isEditing ? "opacity-100" : "opacity-0 max-h-0 overflow-hidden"}`}
    >
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-center">
          <Label htmlFor="categoryName" className="text-sm text-gray-300">
            Category Name
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="status-switch"
              checked={status === "active"}
              onCheckedChange={toggleStatus}
            />
            <Label
              htmlFor="status-switch"
              className={`text-sm ${status === "active" ? "text-green-500" : "text-red-500"}`}
            >
              {status === "active" ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>
        <Input
          id="categoryName"
          value={categoryName}
          onChange={(e) => {
            setCurrentCategory((prev) => ({
              ...prev,
              categoryName: e.target.value,
            }));
          }}
          className={`bg-neutral-800/60 border-neutral-700 text-white focus-visible:ring-blue-600 focus-visible:ring-1 ${isEditing ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <Label htmlFor="description" className="text-sm text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => {
            setCurrentCategory((prev) => ({
              ...prev,
              description: e.target.value,
            }));
          }}
          rows={3}
          className={`w-full resize-none bg-neutral-800/60 border-neutral-700 text-white focus-visible:ring-green-600 focus-visible:ring-1 ${isEditing ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
        />
      </div>
    </div>
  );
};

interface SaveEditProps {
  handleSave: () => void;
  cancelEdit: () => void;
}
export const SaveEdit = ({ handleSave, cancelEdit }: SaveEditProps) => {
  return (
    <div className="flex justify-end gap-3">
      <Button
        variant="secondary"
        onClick={cancelEdit}
        className="bg-neutral-700 text-white hover:bg-neutral-600 focus-visible:ring-offset-neutral-900"
        size="sm"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 text-white focus-visible:ring-offset-neutral-900"
        size="sm"
      >
        Save
      </Button>
    </div>
  );
};
