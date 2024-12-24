"use client";

import { FormEvent, useRef, useState } from "react";
import { FaUpload } from "react-icons/fa6";

import { addNewCategory } from "@/actions/categoryActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { BlogCategory } from "@/types/blogTypes";
import FloatingLabelInput from "../ui/Components/FloatingLabelInput";
import FloatingLabelTxtArea from "../ui/Components/FloatingLabelTxtArea";
import { mutate } from "swr";

export default function AddCategory() {
  const [newCategory, setNewCategory] = useState<BlogCategory>({
    categoryName: "",
    description: "",
    totalPosts: 0,
    categoryId: "",
    createdAt: null,
    updatedAt: null,
    status: "active",
  });
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { addNotification } = useNotification();
  const handleCategorySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setShowLoading(true);
      if (!newCategory.categoryName) {
        inputRef.current?.focus();
        return addNotification({ message: "Category name is required" });
      }

      if (!newCategory.description) {
        textAreaRef.current?.focus();
        return addNotification({ message: "Category description is required" });
      }
      const response = await addNewCategory(newCategory);
      mutate(`/api/categories`, (current: BlogCategory[] | undefined) => {
        if (!current) return current;
        return [newCategory, ...current];
      });
      setNewCategory({
        categoryName: "",
        description: "",
        totalPosts: 0,
        categoryId: "",
        createdAt: null,
        updatedAt: null,
        status: "active",
      });

      if (response.status === "success") {
        addNotification({
          message: "New category created",
          type: NotificationType.SUCCESS,
        });
      }
    } catch (error) {
      addNotification({ message: "Failed to add category" });
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleCategorySubmit}
        className="flex flex-col gap-4 mb-6 text-xl leading-relaxed"
        autoSave=""
        autoComplete="on"
      >
        <FloatingLabelInput
          label="Category Name"
          value={newCategory.categoryName}
          onChange={(e) =>
            setNewCategory((prev) => ({
              ...prev,
              categoryName: e.target.value,
            }))
          }
          ref={inputRef}
        />

        <FloatingLabelTxtArea
          label="Category Description"
          value={newCategory.description}
          onChange={(e) =>
            setNewCategory((prev) => ({ ...prev, description: e.target.value }))
          }
          ref={textAreaRef}
        />

        <button
          type="submit"
          className="px-12 w-80 h-12 py-2 active:scale-95 transition duration-200 gap-3 bg-[var(--highlight-bg-color)] self-end hover:bg-[var(--highlight-bg-hover-color)] text-white rounded-md flex items-center justify-center"
        >
          {showLoading ? (
            <PulsingDotSpinner />
          ) : (
            <>
              <FaUpload className="h-5 w-5" /> Upload Category
            </>
          )}
        </button>
      </form>
    </>
  );
}

const PulsingDotSpinner = () => (
  <div className="flex space-x-2">
    {[1, 2, 3].map((dot) => (
      <div
        key={dot}
        className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"
        style={{
          animationDelay: `${(dot - 1) * 0.2}s`,
          animationDuration: "1.5s",
        }}
      />
    ))}
  </div>
);
