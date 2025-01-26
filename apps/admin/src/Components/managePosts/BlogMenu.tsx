import { AdminBlogMetadata } from "@/types/blogTypes";
import {
  FaPencil,
  FaTrash,
  FaPowerOff,
  FaShare,
  FaImage,
} from "react-icons/fa6";

export default function BlogMenu({
  selectedBlog,
  blogId,
  menuActions,
}: {
  selectedBlog: AdminBlogMetadata | null;
  blogId: string;
  menuActions: {
    handleBlogEdit: () => void;
    handleBlogDelete: () => void;
    handleStatus: () => void;
    handleShareBlog: () => void;
    handleThumbnail: () => void;
  };
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
        <button
          onClick={menuActions.handleBlogEdit}
          className={`${menuItemStyle}`}
        >
          <FaPencil className="w-5 h-5" />
          <span>Edit</span>
        </button>

        <div className="border-t border-gray-700/30"></div>

        <button
          onClick={menuActions.handleThumbnail}
          className={`${menuItemStyle}`}
        >
          <FaImage className="w-5 h-5" />
          <span>Thumbnail</span>
        </button>

        <div className="border-t border-gray-700/30"></div>

        <button
          onClick={menuActions.handleStatus}
          className={`${menuItemStyle}`}
        >
          <FaPowerOff className="w-5 h-5" />
          <span>
            {selectedBlog?.status === "active" ? "Deactivate" : "Activate"}
          </span>
        </button>

        <button
          onClick={menuActions.handleShareBlog}
          className={`${menuItemStyle}`}
        >
          <FaShare className="w-5 h-5" />
          <span> Share </span>
        </button>
      </div>

      <div className="border-t border-gray-700/30"></div>

      <button
        onClick={menuActions.handleBlogDelete}
        className={`${menuItemStyle}`}
      >
        <FaTrash className="w-5 h-5" />
        <span>Delete</span>
      </button>
    </div>
  );
}
