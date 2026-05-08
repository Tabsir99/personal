import { loadBlogForEditing } from "@/actions/blogActions";
import { redirect } from "next/navigation";
import TextEditor from "@/components/write-post/AppEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
  const { blogId } = await params;
  const { data } = await loadBlogForEditing(blogId);

  if (!data) {
    return redirect("/dashboard/write-blog");
  }

  return <TextEditor blogFormData={data} />;
}
