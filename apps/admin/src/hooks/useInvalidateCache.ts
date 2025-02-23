import { AdminBlogListItem, BlogCategory, BlogStatus } from "@/types/blogTypes";
import { mutate } from "swr";

export const invalidateBlogOverview = ({
  selectedBlog,
  categories,
  type,
}: {
  selectedBlog: AdminBlogListItem;
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
      (current: AdminBlogListItem[] | undefined) => {
        if (!current) return current;
        switch (type) {
          case "add":
            return [selectedBlog, ...current];

          case "update":
            return current.map((item) => {
              if (item.blogId !== selectedBlog.blogId) {
                return item;
              }
              return selectedBlog;
            });

          case "delete":
            return current.filter(
              (item) => item.blogId !== selectedBlog.blogId
            );

          case "status":
            return current.map((item) => {
              if (item.blogId !== selectedBlog.blogId) return item;
              return {
                ...item,
                status:
                  selectedBlog.status === BlogStatus.Active
                    ? BlogStatus.Inactive
                    : BlogStatus.Active,
              };
            });
        }
      },
      false
    );
  });
};
