"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadBlog } from "@/actions/blogActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import { useWriteBlogContext } from "@/context/WriteBlogContext";

export default function PreviewBlog() {
  const { addNotification } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const { resetBlogFormData, blogFormData } = useWriteBlogContext();

  const router = useRouter();

  const handleUpload = async () => {
    if (!blogFormData)
      return addNotification({ message: "Blogmetadata is missing" });

    // for (const [key, value] of Object.entries(blogFormData)) {
    //   if (key === "createdAt") continue;
    //   if (!value) {
    //     addNotification({ message: `${key} is required in metadata` });
    //     return;
    //   }
    // }

    if (!blogFormData.content)
      return addNotification({ message: "There is no blog content" });
    setIsUploading(true);

    const res = await uploadBlog(blogFormData);
    setIsUploading(false);
    addNotification({
      message: res.message,
      type:
        res.status === "success"
          ? NotificationType.SUCCESS
          : NotificationType.ERROR,
    });
    if (res.status === "success") {
      // invalidateBlogOverview({
      //   selectedBlog: res.data as AdminBlogListItem,
      //   categories: categories!,
      //   type: blogFormData.createdAt ? "update" : "add",
      // });
      resetBlogFormData();
      router.push("/dashboard/manage-posts");
    }
  };

  return (
    <section className="min-h-screen text-gray-300 flex flex-col justify-start items-start px-12 pb-8 leading-[1.65] rounded-xl max-w-[50rem] mx-auto gap-8 bg-[#0e1117]">
      <header className="w-full">
        <div className="flex items-center text-lg gap-3 px-0 py-10 border-b-2 relative mb-8 border-gray-800 ">
          <Link href="/"> blogs </Link> &gt;
          <Link href="#">
            {" "}
            {blogFormData.blogName
              ?.trim()
              .replace(/\s/g, "-")
              .toLowerCase()
              .slice(0, 25) + "..."}{" "}
          </Link>
          <div className="absolute top-8 right-0 flex gap-3 items-center">
            <button
              onClick={handleUpload}
              type="button"
              className="bg-neutral-800/90 flex justify-center items-center w-24 h-10 gap-3 justify-self-end hover:bg-neutral-800/50 text-white font-bold py-2 px-3 text-sm rounded-lg transition duration-300 ease-in-out"
            >
              {!isUploading ? "UPLOAD" : <Spinner />}
            </button>
            <Link
              href="./"
              className="bg-neutral-700/30 text-white font-bold py-2 px-3 text-sm rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              EDIT
            </Link>
          </div>
        </div>

        <h1 className="text-3xl max-sm:text-2xl text-blue-400 capitalize pr-24 w-fit mb-3">
          {blogFormData.blogName}
        </h1>
        <p className="text-xl">Author: Tabsir</p>
        <time>{new Date().toLocaleDateString()}</time>
      </header>

      <article
        className="article-body text-[20px] max-sm:text-[18px] text-gray-300 w-full flex flex-col gap-[96px] max-sm:gap-[80px]"
        dangerouslySetInnerHTML={{ __html: blogFormData.content! }}
      />
    </section>
  );
}

const Spinner = () => {
  const SpinnerArm = ({ delay }: { delay?: string }) => {
    return (
      <div
        style={{
          animationDelay: `${delay}`,
        }}
        className="block absolute w-5 h-5 m-0.5 border-2 border-spinnerColor rounded-full animate-spin"
      />
    );
  };
  return (
    <div className="relative w-full h-full flex justify-center ">
      <SpinnerArm delay="-0.45s" />
      <SpinnerArm delay="-0.3s" />
      <SpinnerArm delay="-0.15s" />
      <SpinnerArm />
    </div>
  );
};
