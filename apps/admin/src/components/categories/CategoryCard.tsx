"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Trash2, Pencil } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { deleteCategory, updateCategory } from "@/actions/categoryActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { BlogCategory, CategoryStatus } from "@/types/blogTypes";
import { EditName, SaveEdit } from "./CategoryEdit";

export default function CategoryCard({ category }: { category: BlogCategory }) {
  const [editingState, setEditingState] = useState({
    editing: false,
    deleting: false,
  });
  const [currentCategory, setCurrentCategory] = useState(category);
  const router = useRouter();
  const { addNotification } = useNotification();

  function toggleStatus() {
    setCurrentCategory((prev) => ({
      ...prev,
      status:
        prev.status === CategoryStatus.Active
          ? CategoryStatus.Inactive
          : CategoryStatus.Active,
    }));
  }

  const handleDelete = async () => {
    const response = await deleteCategory(currentCategory.categoryId);
    setEditingState({ deleting: false, editing: false });
    if (response) {
      addNotification({
        message: response.message,
        type: NotificationType.INFO,
      });
      router.refresh();
    }
  };

  const handleSave = async () => {
    const response = await updateCategory({
      categoryName: currentCategory.categoryName,
      description: currentCategory.description,
      status: currentCategory.status,
      categoryId: currentCategory.categoryId,
    });

    setEditingState({
      ...editingState,
      editing: false,
    });
    if (response.status === "success") {
      router.refresh();
    }
  };

  const cancelEdit = () => {
    setEditingState((prev) => ({
      ...prev,
      editing: false,
    }));
    setCurrentCategory((prev) => ({
      ...prev,
      categoryName: category.categoryName,
      description: category.description,
      status: category.status,
    }));
  };
  return (
    <Card
      className={`bg-zinc-900 border-zinc-800 text-white shadow-lg border-2 transition-all duration-300 flex flex-col justify-between
        ${editingState.editing ? "max-h-[500px]" : "max-h-80"}`}
    >
      <CardHeader className="transition-all duration-300 ease-in-out overflow-hidden">
        <div
          className={`transition-opacity flex flex-col gap-3 duration-300 ease-in-out ${editingState.editing ? "opacity-0 h-0" : "opacity-100 h-32"}`}
        >
          <h2 className="text-3xl font-bold tracking-tight capitalize text-gray-100">
            {currentCategory.categoryName}
          </h2>
          <p className="text-gray-300">{currentCategory.description}</p>
        </div>

        <EditName
          isEditing={editingState.editing}
          status={currentCategory.status}
          toggleStatus={toggleStatus}
          categoryName={currentCategory.categoryName}
          description={currentCategory.description}
          setCurrentCategory={setCurrentCategory}
        />
      </CardHeader>
      <CardContent className="flex flex-col justify-between transition-all duration-300 ease-in-out pb-6">
        <div className="space-y-3 text-xs uppercase tracking-wider">
          <div className="flex gap-3">
            <span className="text-zinc-500 font-medium">Created: </span>
            <time className="text-zinc-300">
              {new Date(currentCategory.createdAt).toDateString()}
            </time>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 font-medium">Last Updated: </span>
            <time className="text-zinc-300">
              {new Date(currentCategory.updatedAt).toDateString()}
            </time>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 font-medium">Posts: </span>
            <span className="text-zinc-300">{currentCategory.totalPosts}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-zinc-700 h-14 flex justify-between items-center py-0 transition-all duration-300 ease-in-out">
        <Badge
          variant={
            currentCategory.status === "active" ? "default" : "destructive"
          }
          className="capitalize"
        >
          {currentCategory.status}
        </Badge>
        <div className="relative w-full flex justify-end">
          <div
            className={`absolute top-0 right-0 w-full flex justify-end transition-opacity duration-300 ease-in-out ${editingState.editing ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            <SaveEdit cancelEdit={cancelEdit} handleSave={handleSave} />
          </div>
          <div
            className={`transition-opacity duration-300 ease-in-out ${editingState.editing ? "opacity-0 z-0" : "opacity-100 z-10"}`}
          >
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setEditingState({ ...editingState, editing: true })
                }
                className="text-green-500 hover:text-green-400 hover:bg-zinc-800"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setEditingState({ ...editingState, deleting: true })
                }
                className="text-rose-500 hover:text-rose-400 hover:bg-zinc-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-gray-400 hover:text-gray-300 hover:bg-zinc-800"
              >
                <Link
                  href={`/dashboard/manage-posts?category=${currentCategory.categoryName}`}
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>

      <AlertDialog open={editingState.deleting}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this category? Confirming won't
              delete the blogs inside that category, but they need to be
              assigned to a new currentCategory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setEditingState((prev) => ({ ...prev, deleting: false }))
              }
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
