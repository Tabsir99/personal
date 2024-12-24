import Image from "next/image";
import { Dispatch, SetStateAction, useRef } from "react";
import { MdUploadFile } from "react-icons/md";

import { uploadImage } from "@/actions/categoryActions";
import { UnstructuredBlogData } from "@/types/blogTypes";

export default function BlogThumbnailInput({
  blogData,
  setBlogData
}: {
  blogData: UnstructuredBlogData;
  setBlogData: Dispatch<SetStateAction<UnstructuredBlogData>>;
}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <div
        onClick={() => {
          if (blogData.thumbnailUrl) {
            return;
          }
          uploadRef.current?.click();
        }}
        className={
          "gap-1 w-fit  hover:bg-gray-700 text-white px-5 py-3 rounded flex items-center bg-neutral-800/70 " +
          (blogData.thumbnailUrl ? "cursor-not-allowed" : "cursor-pointer")
        }
      >
        <MdUploadFile className="h-7 w-7" />{" "}
        {blogData.thumbnailUrl ? blogData.thumbnailUrl : "Upload Feature Image"}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const imageFile = e.target.files?.[0];

            const formData = new FormData();
            formData.append("file", imageFile || "");
            formData.append("category", blogData.categoryId);
            const response = await uploadImage(formData);

            setBlogData((prev) => ({
              ...prev,
              thumbnailUrl: response.data as any,
            }));
          }}
          className=" hidden"
        />
      </div>
      {blogData.thumbnailUrl && (
        <Image
          src={blogData.thumbnailUrl}
          alt="whatever"
          className="border-2 border-gray-700 rounded-lg"
          width={600}
          height={600}
        />
      )}
    </>
  );
}
