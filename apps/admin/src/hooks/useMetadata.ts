"use client";

import { UnstructuredBlogData } from "@/types/blogTypes";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useMetadata({
  blogData,
  setBlogData,
}: {
  blogData: UnstructuredBlogData;
  setBlogData: Dispatch<SetStateAction<UnstructuredBlogData>>;
}) {

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

  return {
    blogData,
    tagInput,
    setTagInput,

    setBlogData,

    addTag,
    removeTag,
    handleOptionChange,
  };
}
