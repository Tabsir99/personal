"use client";

import { useBlogContext } from "@/context/WriteBlogContext";
import CategoryCard from "./CategoryCard";

export default function AllCategories() {
  const { categories } = useBlogContext();
  if (!categories) return null;
  return (
    <>
      {categories.map((category) => {
        return <CategoryCard key={category.categoryId} category={category} />;
      })}
    </>
  );
}
