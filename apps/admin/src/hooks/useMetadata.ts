"use client";

import { useNotification } from "@/context/NotificationContext";
import { UnstructuredBlogData } from "@/types/blogTypes";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useMetadata({
  blogData,
  setBlogData,
}: {
  blogData: UnstructuredBlogData;
  setBlogData: Dispatch<SetStateAction<UnstructuredBlogData>>;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();

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

  const handleWriteBlog = (showEditor: boolean) => {
    if (blogData.categoryId === "") {
      return addNotification({ message: "Category Id is required" });
    }
    if (blogData.blogName === "") {
      return addNotification({ message: "Blogname is missing" });
    }

    setIsLoading(true);

    if (!blogData.socialTitle) {
      blogData.socialTitle = blogData.blogName;
    }
    const metaDataString = JSON.stringify(blogData);
    localStorage.setItem("metaData", metaDataString);

    if (showEditor) {
      router.push("/dashboard/write-post/write-blog");
    } else {
      setIsLoading(false);
    }
  };

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
    isLoading,
    blogData,
    tagInput,
    setTagInput,

    setBlogData,

    handleWriteBlog,
    addTag,
    removeTag,
    handleOptionChange,
  };
}
