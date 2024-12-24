import React from "react";
import { FaPencil, FaTrash, FaPowerOff } from "react-icons/fa6";

import { BlogStatus } from "@/types/blogTypes";

export default function BlogMenu({
  selectedBlog,
  blogId,
  handleBlogEdit,
  handleBlogDelete,
  handleStatus,
  status,
}: {
  selectedBlog: { link: string; categoryId: string } | null;
  blogId: string;
  handleBlogEdit: () => void;
  handleBlogDelete: () => void;
  handleStatus: () => void;
  status: BlogStatus;
}) {
  const menuItemStyle =
    "flex items-center justify-start space-x-2 px-4 py-3 w-full text-left transition-all text-gray-300 hover:bg-neutral-800 duration-300 ease-in-out";

  return (
    <div
      className={`absolute right-14 top-4 z-50 w-36 bg-neutral-900  rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 ease-in-out ${
        selectedBlog?.link === blogId
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="bg-gray-900/40 backdrop-blur-md">
        <button onClick={handleBlogEdit} className={`${menuItemStyle}`}>
          <FaPencil className="w-5 h-5" />
          <span>Edit</span>
        </button>

        <div className="border-t border-gray-700/30"></div>

        <button onClick={handleBlogDelete} className={`${menuItemStyle}`}>
          <FaTrash className="w-5 h-5" />
          <span>Delete</span>
        </button>

        <div className="border-t border-gray-700/30"></div>

        <button onClick={handleStatus} className={`${menuItemStyle}`}>
          <FaPowerOff className="w-5 h-5" />
          <span>{status === "active" ? "Deactivate" : "Activate"}</span>
        </button>
      </div>
    </div>
  );
}
