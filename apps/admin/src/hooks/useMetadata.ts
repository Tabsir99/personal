"use client";
import { BlogType, BlogFormData, BlogStatus } from "@/types/blogTypes";
import { LocalStorageKeys } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

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
    categoryId: "",
    recommendationTitle: "Keep reading...",
    socialTitle: "",
    featuredImageUrl: "",
    type: BlogType.Article,
    link: "",
    content: null,
    estReadTime: null,
    status: BlogStatus.Draft,
    blogId: "temp-id",
  }).current;

  const [blogFormData, setBlogFormData] =
    useState<BlogFormData>(defaultBlogFormData);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem(LocalStorageKeys.BlogFormData);
    if (!savedData) return;

    try {
      const parsedData = JSON.parse(savedData) as Partial<BlogFormData>;
      setBlogFormData({
        ...defaultBlogFormData,
        ...parsedData,
        // Preserve these values from state if they exist
        status: parsedData.status || BlogStatus.Draft,
        content: parsedData.content || "",
      });
    } catch (error) {
      console.error("Error parsing saved blog data:", error);
    }
  }, []);

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
