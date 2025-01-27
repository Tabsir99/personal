"use client";

import BlogTagInput from "./BlogTagInput";
import BlogThumbnailInput from "./BlogThumbnail";

import CustomSelect from "../ui/Components/CustomSelect";
import FloatingLabelInput from "../ui/Components/FloatingLabelInput";
import { useBlogContext } from "@/context/WriteBlogContext";

export default function WriteMetadataComp({
  closeSidebar,
}: {
  closeSidebar?: () => void;
}) {
  const { blogData, setBlogData, handleOptionChange, categories } =
    useBlogContext();

  return (
    <>
      <div className="flex gap-4">
        <FloatingLabelInput
          label="Blog Title"
          onChange={(e) =>
            setBlogData((prev) => ({ ...prev, blogName: e.target.value }))
          }
          value={blogData.blogName}
          required={true}
        />

        <FloatingLabelInput
          label="Social Meida title"
          value={blogData.socialTitle}
          onChange={(e) =>
            setBlogData((prev) => ({ ...prev, socialTitle: e.target.value }))
          }
        />
      </div>

      <div className="flex gap-4">
        <CustomSelect
          options={[
            "Select a category...",
            ...(categories?.map((category) => category.categoryId) || []),
          ]}
          defaultActiveOption={blogData.categoryId}
          onOptionChange={handleOptionChange}
          optionsClass="capitalize h-14 px-4 flex items-center justify-between border-t border-gray-900 cursor-pointer hover:bg-slate-700 transition duration-150"
        />
        <CustomSelect
          options={[
            "Select blog type...",
            "Article",
            "BlogPosting",
            "NewsArticle",
          ]}
          onOptionChange={(option) => {
            setBlogData((prev) => ({
              ...prev,
              type: option,
            }));
          }}
          defaultActiveOption={blogData.type}
          optionsClass="capitalize h-14 px-4 flex items-center justify-between border-t border-gray-900 cursor-pointer hover:bg-slate-700 transition duration-150"
        />
      </div>

      <BlogTagInput />

      <BlogThumbnailInput blogData={blogData} setBlogData={setBlogData} />

      <textarea
        rows={3}
        placeholder="Enter a breif description about the blog...."
        className="w-full px-5 py-3 mb-6 bg-neutral-800/70 resize-none text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        value={blogData.blogDescription}
        onChange={(e) =>
          setBlogData((prev) => ({
            ...prev,
            blogDescription: e.target.value,
          }))
        }
      />

      <button
        type="button"
        onClick={() => {
          if (closeSidebar) closeSidebar();
          localStorage.setItem("metaData", JSON.stringify(blogData));
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
