import { loadBlogForEditing } from "@/actions/blogActions";
import { notFound } from "next/navigation";
import TextEditor from "@/components/write-post/AppEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  const result = await loadBlogForEditing(blogId);

  if (result.status !== "success") return notFound();

  return <TextEditor blogFormData={result.data} />;
}
