"use client";

import { useCustomSWR } from "@/hooks/useCustomSwr";
import useBlogData from "@/hooks/useMetadata";
import { BlogCategory, UnstructuredBlogData } from "@/types/blogTypes";
import {
  createContext,
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

const BlogMetadataContext = createContext<BlogMetadataContextType | undefined>(
  undefined
);

export const BlogMetadataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const blogTools = useBlogData();
  const { data } = useCustomSWR<BlogCategory[]>(`/api/local/categories`);

  useEffect(() => {
    const storedData = localStorage.getItem("metaData");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        blogTools.setBlogData(parsedData);
      } catch (error) {
        console.error("Failed to parse stored metadata", error);
      }
    }
  }, []);

  

  return (
    <BlogMetadataContext.Provider
      value={{
        categories: data,
        ...blogTools,
      }}
    >
      {children}
    </BlogMetadataContext.Provider>
  );
};

// Custom hook to use the context
export const useBlogContext = () => {
  const context = useContext(BlogMetadataContext);
  if (!context) {
    throw new Error(
      "useBlogMetadata must be used within a BlogMetadataProvider"
    );
  }
  return context;
};
