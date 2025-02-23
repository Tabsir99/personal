"use client";

import { useCustomSWR } from "@/hooks/useCustomSwr";
import useBlogFormData, { UseBlogFormData } from "@/hooks/useMetadata";
import { BlogCategory } from "@/types/blogTypes";
import { createContext, useContext, ReactNode } from "react";

interface WriteBlogContextType extends UseBlogFormData {
  categories: BlogCategory[];
}

const BlogMetadataContext = createContext<WriteBlogContextType | undefined>(
  undefined
);

export const BlogMetadataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const blogTools = useBlogFormData();
  const { data } = useCustomSWR<BlogCategory[]>(`/api/local/categories`);

  return (
    <BlogMetadataContext.Provider
      value={{
        categories: data || [],
        ...blogTools,
      }}
    >
      {children}
    </BlogMetadataContext.Provider>
  );
};

// Custom hook to use the context
export const useWriteBlogContext = () => {
  const context = useContext(BlogMetadataContext);
  if (!context) {
    throw new Error(
      "useBlogMetadata must be used within a BlogMetadataProvider"
    );
  }
  return context;
};
