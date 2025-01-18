import { AdminBlogMetadata, BlogCategory } from "@/types/blogTypes";
import { mutate } from "swr";

export const invalidateBlogOverview = ({
  selectedBlog,
  categories,
  type,
}: {
  selectedBlog: AdminBlogMetadata;
  categories: BlogCategory[];
  type: "delete" | "add" | "status" | "update";
}) => {
  const matchingPatterns = [
    `/api/local/blogOverview`,
    ...categories.map(
      (category) =>
        `/api/local/blogOverview?categoryId=${category.categoryId}&status=`
    ),
  ];

  matchingPatterns.forEach((pattern) => {
    mutate(
      pattern,
      (current: AdminBlogMetadata[] | undefined) => {
        if (!current) return current;
        switch (type) {
          case "add":
            return [selectedBlog, ...current];

          case "update":
            return current.map((item) => {
              if (item.link !== selectedBlog.link) {
                return item;
              }
              return selectedBlog;
            });

          case "delete":
            return current.filter((item) => item.link !== selectedBlog.link);

          case "status":
            return current.map((item) => {
              if (item.link !== selectedBlog.link) return item;
              return {
                ...item,
                status:
                  selectedBlog.status === "active" ? "inactive" : "active",
              };
            });
        }
      },
      false
    );
  });
};
