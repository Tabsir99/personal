import Link from "next/link";
import { MdSettings, MdLink } from "react-icons/md";

import { AdminBlogMetadata } from "@/types/blogTypes";
import { env } from "@/utils/utils";

export default function CMSBlogCard({
  blog,
  toggleToolbar,
}: {
  blog: AdminBlogMetadata;
  toggleToolbar: (blogMetadata: AdminBlogMetadata) => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center">
        {/* Blog Title */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-100 capitalize">
            {blog.blogName}
          </h2>
          <div className="flex space-x-3 mt-2 text-gray-400">
            <span>{blog.categoryId}</span>
            <span>|</span>
            <time>{new Date(blog.createdAt).toDateString()}</time>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => toggleToolbar(blog)}
            className="text-gray-400 hover:text-gray-500 hover:rotate-45 transition duration-200"
          >
            <MdSettings className="w-7 h-7" />
          </button>
          <Link
            href={`${env.BLOGSITE_HOSTNAME}/blogs/${blog.link}`}
            target="_blank"
            className="text-gray-400 hover:text-gray-200"
          >
            <MdLink className="w-7 h-7" />
          </Link>
        </div>
      </div>

      {/* Post Stats */}
      <div className="grid grid-cols-4 gap-0 border-t-2 border-gray-700 pt-3">
        <div className="flex flex-col text-gray-400">
          <span className="text-lg font-semibold text-gray-200">
            {blog.pageMetrics.totalVisitors}
          </span>
          <span>Views</span>
        </div>
        <div className="flex flex-col text-gray-400">
          <span className="text-lg font-semibold text-gray-200">
            {blog.pageMetrics.blogMetrics?.totalLikes}
          </span>
          <span>Likes</span>
        </div>
        <div className="flex flex-col text-gray-400">
          <span className="text-lg font-semibold text-gray-200">
            {blog.pageMetrics.blogMetrics?.totalComments}
          </span>
          <span>Comments</span>
        </div>
        <div className="flex flex-col text-gray-400">
          <span
            className={`text-lg font-semibold ${
              blog.status === "active" ? "text-green-500" : "text-red-500"
            }`}
          >
            {blog.status}
          </span>
          <span>Status</span>
        </div>
      </div>
    </>
  );
}
