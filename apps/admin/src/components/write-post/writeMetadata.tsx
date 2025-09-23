"use client";

import BlogTagInput from "./BlogTagInput";
import BlogThumbnailInput from "./BlogThumbnail";

import CustomSelect from "../ui/common/CustomSelect";
import FloatingLabelInput from "../ui/common/FloatingLabelInput";
import { BlogType } from "@/types/blogTypes";
import FloatingLabelTxtArea from "../ui/common/FloatingLabelTxtArea";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";
import { useShallow } from "zustand/shallow";

export default function WriteMetadataComp({
  closeSidebar,
}: {
  closeSidebar?: () => void;
}) {
  const setBlogFormData = useBlogEditorStore.getState().setBlogFormData;

  const [blogName, socialTitle, type, description] = useBlogEditorStore(
    useShallow((state) => {
      const d = state.blogFormData;
      return [d.blogName, d.socialTitle, d.type, d.blogDescription];
    })
  );

  return (
    <>
      <div className="flex gap-4">
        <FloatingLabelInput
          label="Blog Title"
          onChange={(e) => setBlogFormData({ blogName: e.target.value })}
          value={blogName}
          required={true}
        />

        <FloatingLabelInput
          label="Social Meida title"
          value={socialTitle}
          onChange={(e) => setBlogFormData({ socialTitle: e.target.value })}
        />
      </div>

      <div className="flex gap-4">
        <CustomSelect
          options={[
            "Select blog type...",
            BlogType.Article,
            BlogType.BlogPosting,
            BlogType.NewsArticle,
          ]}
          onOptionChange={(option: BlogType) => {
            setBlogFormData({ type: option });
          }}
          defaultActiveOption={type}
        />
      </div>

      <BlogTagInput />

      <BlogThumbnailInput />

      <FloatingLabelTxtArea
        rows={3}
        label="Blog Description"
        placeholder="Enter a breif description about the blog...."
        // className="w-full px-5 py-3 mb-6 bg-zinc-800/70 resize-none text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        value={description}
        onChange={(e) => setBlogFormData({ blogDescription: e.target.value })}
      />

      <button
        type="button"
        onClick={() => {
          if (closeSidebar) closeSidebar();
        }}
        className={
          "p-3 bg-[var(--highlight-bg-color)] hover:bg-[var(--highlight-bg-hover-color)] rounded-md text-gray-300 block "
        }
      >
        Save Metadata
      </button>
    </>
  );
}
