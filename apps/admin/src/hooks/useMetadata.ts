"use client";

import { UnstructuredBlogData } from "@/types/blogTypes";
import { useEffect, useState } from "react";

const defaultBlogData: UnstructuredBlogData = {
  blogName: "",
  blogDescription: "",
  blogTags: [],
  categoryId: "",
  recommendationTitle: "Keep reading...",
  socialTitle: "",
  thumbnailUrl: "",
  type: "",
  createdAt: "",
  estReadTime: "",
};
export default function useBlogData() {
  const [blogData, setBlogData] =
    useState<UnstructuredBlogData>(defaultBlogData);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const metadataString = localStorage.getItem("metaData");
    if (!metadataString) return;
    try {
      const blogMetadataObject = JSON.parse(
        metadataString
      ) as UnstructuredBlogData;

      setBlogData({
        blogName: blogMetadataObject.blogName || "",
        blogDescription: blogMetadataObject.blogDescription || "",
        blogTags: blogMetadataObject.blogTags || [],
        categoryId: blogMetadataObject.categoryId || "",
        recommendationTitle: blogMetadataObject.recommendationTitle || "",
        socialTitle: blogMetadataObject.socialTitle || "",
        thumbnailUrl: blogMetadataObject.thumbnailUrl || "",
        type: blogMetadataObject.type || "",
        createdAt: blogMetadataObject.createdAt || "",
        estReadTime: blogMetadataObject.estReadTime || "",
      });
    } catch (error) {
      return;
    }
  }, []);

  const addTag = () => {
    if (tagInput && !blogData.blogTags.includes(tagInput)) {
      setBlogData((prev) => ({
        ...prev,
        blogTags: [...prev.blogTags, tagInput],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlogData((prev) => ({
      ...prev,
      blogTags: prev.blogTags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleOptionChange = (option: string) => {
    setBlogData((prev) => ({ ...prev, categoryId: option }));
  };

  const resetBlogData = () => {
    // Not passing any argument causes it to use default data
    setBlogData(defaultBlogData);
    localStorage.removeItem("metaData");
    localStorage.removeItem("blogHTML");
  };

  return {
    blogData,
    tagInput,

    setTagInput,
    resetBlogData,
    setBlogData,
    addTag,
    removeTag,
    handleOptionChange,
  };
}
