export interface BlogListRow {
  blogId: string;
  title: string;
  slug: string;
  status: "published" | "unpublished" | "archived" | "draft";
  tags: string[];
  kind: string;
  createdAt: number;
  publishedAt: number;
  featuredAt: number | null;
}
