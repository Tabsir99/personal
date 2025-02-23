"use client";

import BlogTagInput from "./BlogTagInput";
import BlogThumbnailInput from "./BlogThumbnail";

import CustomSelect from "../ui/Components/CustomSelect";
import FloatingLabelInput from "../ui/Components/FloatingLabelInput";
import { useWriteBlogContext } from "@/context/WriteBlogContext";
import { BlogType } from "@/types/blogTypes";
import FloatingLabelTxtArea from "../ui/Components/FloatingLabelTxtArea";
import { LocalStorageKeys } from "@/types/types";

export default function WriteMetadataComp({
  closeSidebar,
}: {
  closeSidebar?: () => void;
}) {
  const { blogFormData, setBlogFormData, handleOptionChange, categories } =
    useWriteBlogContext();

  return (
    <>
      <div className="flex gap-4">
        <FloatingLabelInput
          label="Blog Title"
          onChange={(e) =>
            setBlogFormData((prev) => ({ ...prev, blogName: e.target.value }))
          }
          value={blogFormData.blogName}
          required={true}
        />

        <FloatingLabelInput
          label="Social Meida title"
          value={blogFormData.socialTitle}
          onChange={(e) =>
            setBlogFormData((prev) => ({
              ...prev,
              socialTitle: e.target.value,
            }))
          }
        />
      </div>

      <div className="flex gap-4">
        <CustomSelect
          options={[
            "Select a category...",
            ...(categories?.map((category) => category.categoryId) || []),
          ]}
          defaultActiveOption={blogFormData.categoryId}
          onOptionChange={handleOptionChange}
        />
        <CustomSelect
          options={[
            "Select blog type...",
            BlogType.Article,
            BlogType.BlogPosting,
            BlogType.NewsArticle,
          ]}
          onOptionChange={(option: BlogType) => {
            setBlogFormData((prev) => ({
              ...prev,
              type: option,
            }));
          }}
          defaultActiveOption={blogFormData.type}
        />
      </div>

      <BlogTagInput />

      <BlogThumbnailInput />

      <FloatingLabelTxtArea
        rows={3}
        label="Blog Description"
        placeholder="Enter a breif description about the blog...."
        // className="w-full px-5 py-3 mb-6 bg-neutral-800/70 resize-none text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        value={blogFormData.blogDescription}
        onChange={(e) =>
          setBlogFormData((prev) => ({
            ...prev,
            blogDescription: e.target.value,
          }))
        }
      />

      <button
        type="button"
        onClick={() => {
          if (closeSidebar) closeSidebar();
          localStorage.setItem(LocalStorageKeys.BlogFormData, JSON.stringify(blogFormData));
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
