"use client";

import { useCustomSWR } from "@/hooks/useCustomSwr";
import useMetadata from "@/hooks/useMetadata";
import { BlogCategory, UnstructuredBlogData } from "@/types/blogTypes";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

interface BlogMetadataContextType {
  resetBlogData: () => void;
  blogData: UnstructuredBlogData;
  tagInput: string;
  setTagInput: Dispatch<SetStateAction<string>>;
  setBlogData: Dispatch<SetStateAction<UnstructuredBlogData>>;
  addTag: () => void;
  removeTag: (tagToRemove: string) => void;
  handleOptionChange: (option: string) => void;

  categories: BlogCategory[] | undefined;
}

// Create context with default values
const BlogMetadataContext = createContext<BlogMetadataContextType | undefined>(
  undefined
);

// Default initial state
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

// Provider component
export const BlogMetadataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [blogData, setBlogData] =
    useState<UnstructuredBlogData>(defaultBlogData);

  const blogEditingTools = useMetadata({ blogData, setBlogData });
  const { data } = useCustomSWR<BlogCategory[]>(`/api/local/categories`);

  useEffect(() => {
    const storedData = localStorage.getItem("metaData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setBlogData(parsedData);
      } catch (error) {
        console.error("Failed to parse stored metadata", error);
      }
    }
  }, []);

  const resetBlogData = () => {
    setBlogData(defaultBlogData);
    localStorage.removeItem("metaData");
    localStorage.removeItem("blogHTML");
  };

  return (
    <BlogMetadataContext.Provider
      value={{
        resetBlogData,
        categories: data,
        ...blogEditingTools,
      }}
    >
      {children}
    </BlogMetadataContext.Provider>
  );
};

// Custom hook to use the context
export const useBlogMetadata = () => {
  const context = useContext(BlogMetadataContext);
  if (!context) {
    throw new Error(
      "useBlogMetadata must be used within a BlogMetadataProvider"
    );
  }
  return context;
};
