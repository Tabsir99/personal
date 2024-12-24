import Link from "next/link";
import { FaPlus } from "react-icons/fa6";

import BlogOverview from "@/Components/managePosts/BlogOverview";

export const metadata = {
  title: "Manage Posts",
};

const ManagePosts = async () => {
  return (
    <div className="p-6 bg-neutral-900/60 text-white min-h-screen">
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Link
          href="write-post"
          className="bg-[var(--highlight-bg-color)] hover:bg-[var(--highlight-bg-hover-color)] text-gray-200 py-2 px-4 rounded flex items-center"
        >
          <FaPlus className="h-6 w-6 mr-2" /> Create New Post
        </Link>
      </div>
      <BlogOverview />
    </div>
  );
};

export default ManagePosts;

