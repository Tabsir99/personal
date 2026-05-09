import { PublishedBlogDB, BlogStatus } from "@tabsircg/schemas/blog";
import { mutate } from "swr";

export const invalidateBlogOverview = ({
  selectedBlog,
  type,
}: {
  selectedBlog: PublishedBlogDB;
  type: "delete" | "add" | "status" | "update";
}) => {
  const matchingPatterns = [`/api/local/blogOverview`];

  matchingPatterns.forEach((pattern) => {
    mutate(
      pattern,
      (current: PublishedBlogDB[] | undefined) => {
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
              (item) => item.blogId !== selectedBlog.blogId,
            );

          case "status":
            return current.map((item) => {
              if (item.blogId !== selectedBlog.blogId) return item;
              return {
                ...item,
                status:
                  selectedBlog.status === BlogStatus.published
                    ? BlogStatus.unpublished
                    : BlogStatus.published,
              };
            });
        }
      },
      false,
    );
  });
};
