import { FaPlus } from "react-icons/fa6";

import FloatingLabelInput from "@/components/ui/common/FloatingLabelInput";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useState } from "react";
import { useShallow } from "zustand/shallow";

export default function BlogTagInput() {
  const { addTag, removeTag, setBlogFormData } = useBlogEditorStore.getState();
  const blogFormData = useBlogEditorStore(
    useShallow((state) => state.blogFormData)
  );

  const [tagInput, setTagInput] = useState("");
  return (
    <>
      <div className="flex">
        <FloatingLabelInput
          label="Blog Tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag(tagInput)}
        />
        <button
          onClick={() => addTag(tagInput)}
          className="bg-[var(--highlight-bg-color)] mr-4 hover:bg-[var(--highlight-bg-hover-color)] text-gray-300 px-3 py-2 rounded flex items-center"
        >
          <FaPlus className="h-5 w-7" />
        </button>

        <FloatingLabelInput
          label="Recommendation Title"
          value={blogFormData.recommendationTitle}
          onChange={(e) =>
            setBlogFormData({ recommendationTitle: e.target.value })
          }
        />
      </div>
      <div className=" flex flex-wrap space-x-2">
        {blogFormData.blogTags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-700 px-3 py-1 rounded-full flex items-center space-x-2"
          >
            <span>{tag}</span>
            <button onClick={() => removeTag(tag)} className="text-red-500">
              &times;
            </button>
          </span>
        ))}
      </div>
    </>
  );
}
