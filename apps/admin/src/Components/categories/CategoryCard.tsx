"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaTrash, FaPencil } from "react-icons/fa6";

import { EditName, SaveEdit } from "./CategoryEdit";

import { deleteCategory, updateCategory } from "@/actions/categoryActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { BlogCategory } from "@/types/blogTypes";
import ConfirmationModal from "../ui/Components/ConfirmationModal";

export default function CategoryCard({ category }: { category: BlogCategory }) {
  const [editing, setEditing] = useState({
    editing: false,
    deleting: false,
  });
  const [Category, ModifyCategory] = useState(category);
  const router = useRouter();
  const { addNotification } = useNotification();

  function toggleStatus() {
    ModifyCategory((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }));
  }

  const handleDelete = async () => {
    const response = await deleteCategory(Category.categoryId);
    setEditing({ deleting: false, editing: false });
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
      categoryName: Category.categoryName,
      description: Category.description,
      status: Category.status,
      categoryId: Category.categoryId,
    });

    setEditing({
      ...editing,
      editing: false,
    });
    if (response.status === "success") {
      router.refresh();
    }
  };
  return (
    <div
      className="bg-neutral-900/60 text-white rounded-lg h-80 pb-3 pt-4 px-4 border-2 shadow-md
     shadow-black border-neutral-800 flex flex-col justify-between gap-3"
    >
      <div className="flex flex-col gap-4 h-full justify-between ">
        {editing.editing ? (
          <EditName
            status={Category.status}
            toggleStatus={toggleStatus}
            categoryName={Category.categoryName}
            description={Category.description}
            ModifyCategory={ModifyCategory}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl capitalize text-gray-100 font-bold">
              {Category.categoryName}
            </h2>
            <p className="text-[19px] text-gray-300 mb-0">
              {Category.description}
            </p>
          </div>
        )}

        <div className="flex text-[17px] flex-col gap-2">
          <time className=" text-gray-300 mb-0 block">
            Created: {Category.createdAt}
          </time>
          <time className=" text-gray-300 mb-0 block">
            Last Updated: {Category.updatedAt}
          </time>
          <p className=" text-gray-300 mb-0">
            Total Posts: {Category.totalPosts}
          </p>
        </div>
      </div>

      <div className="flex justify-between px-1 space-x-0 border-t-2 pt-0 items-center border-gray-700">
        <span
          className={`text-base font-medium border w-fit px-3 py-1 rounded-3xl self-end justify-self-end ${
            Category.status === "active"
              ? "text-green-500 border-green-500  "
              : "text-red-500 border-red-500"
          }`}
        >
          {Category.status}
        </span>

        {editing.editing ? (
          <SaveEdit
            setEditing={setEditing}
            ModifyCategory={ModifyCategory}
            unModifiedCategory={category}
            handleSave={handleSave}
          />
        ) : (
          <div>
            <button
              onClick={() => {
                setEditing({
                  ...editing,
                  editing: true,
                });
              }}
              className="text-green-600 active:scale-75 hover:text-[var(--highlight-bg-hover-color)] transition duration-100 px-2 py-2"
            >
              <FaPencil className="h-6 w-6" />
            </button>
            <button
              onClick={() =>
                setEditing({
                  ...editing,
                  deleting: true,
                })
              }
              className=" text-rose-500 text-opacity-80 hover:text-opacity-60 transition-opacity duration-200 px-2 py-2"
            >
              <FaTrash className="h-6 w-6" />
            </button>
            <Link
              href={`/admin/dashboard/manage-posts?category=${Category.categoryName}`}
              className="text-gray-400 hover:text-gray-500 inline-block translate-y-2 transition-colors duration-200 px-2 py-2"
            >
              <FaEye className="h-6 w-6" />
            </Link>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={editing.deleting}
        headerText="Are you sure, you want to delete this category?"
        message="Confirming wont delete the blogs inside that category, but they need to be assgined to a new category"
        onClose={() => {
          setEditing((prev) => ({ ...prev, deleting: false }));
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
