"use client";
import { BlogType, BlogFormData, BlogStatus } from "@/types/blogTypes";
import { LocalStorageKeys } from "@/types/settingTypes";
import { Dispatch, SetStateAction, useRef, useState } from "react";

export interface UseBlogFormData {
  blogFormData: BlogFormData;
  tagInput: string;
  setTagInput: Dispatch<SetStateAction<string>>;
  resetBlogFormData: () => void;
  setBlogFormData: Dispatch<SetStateAction<BlogFormData>>;
  addTag: () => void;
  removeTag: (tagToRemove: string) => void;
  handleOptionChange: (option: string) => void;
  defaultBlogFormData: BlogFormData;
}

export default function useBlogFormData(): UseBlogFormData {
  const defaultBlogFormData = useRef<BlogFormData>({
    blogName: "",
    blogDescription: "",
    blogTags: [],
    recommendationTitle: "Keep reading...",
    socialTitle: "",
    featuredImageUrl: "",
    type: BlogType.Article,
    link: "",
    content: null,
    estReadTime: 1,
    status: BlogStatus.Draft,
    blogId: "",
  }).current;

  const [blogFormData, setBlogFormData] =
    useState<BlogFormData>(defaultBlogFormData);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !blogFormData.blogTags.includes(trimmedTag)) {
      setBlogFormData((prev) => ({
        ...prev,
        blogTags: [...prev.blogTags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlogFormData((prev) => ({
      ...prev,
      blogTags: prev.blogTags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleOptionChange = (option: string) => {
    setBlogFormData((prev) => ({ ...prev, categoryId: option }));
  };

  const resetBlogFormData = () => {
    setBlogFormData(defaultBlogFormData);
    localStorage.removeItem(LocalStorageKeys.BlogFormData);
  };

  return {
    blogFormData,
    tagInput,
    setTagInput,
    resetBlogFormData,
    setBlogFormData,
    addTag,
    removeTag,
    handleOptionChange,
    defaultBlogFormData,
  };
}
