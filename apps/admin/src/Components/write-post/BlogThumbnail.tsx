import Image from "next/image";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { MdUploadFile } from "react-icons/md";

import { uploadImage } from "@/actions/categoryActions";
import { UnstructuredBlogData } from "@/types/blogTypes";
import ConfirmationModal from "../ui/Components/ConfirmationModal";

export default function BlogThumbnailInput({
  blogData,
  setBlogData,
}: {
  blogData: UnstructuredBlogData;
  setBlogData: Dispatch<SetStateAction<UnstructuredBlogData>>;
}) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleThumbnailUpload = async (image?: File) => {
    const formData = new FormData();
    formData.append("file", image || thumbnail as any);
    formData.append(
      "blogLink",
      blogData.blogName.trim().toLowerCase().replace(/\s/g, "-")
    );
    const response = await uploadImage(formData,true);

    setBlogData((prev) => ({
      ...prev,
      thumbnailUrl: response.data as any,
    }));
    setIsOpen(false);
  };
  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        message="Are you sure you want to change the thumbnail?"
        onClose={() => setIsOpen(false)}
        onConfirm={handleThumbnailUpload}
        headerText="It will replace the old thumbnail"
      />
      <div
        onClick={() => {
          uploadRef.current?.click();
        }}
        className={
          "gap-1 w-fit cursor-pointer hover:bg-gray-700 text-white px-5 py-3 rounded flex items-center bg-neutral-800/70 "
        }
      >
        <MdUploadFile className="h-7 w-12" />{" "}
        {blogData.thumbnailUrl ? "Change Thumbnail" : "Upload Thumbnail"}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const imageFile = e.target.files?.[0];

            if (!imageFile) return;
            setThumbnail(imageFile);
            if (blogData.thumbnailUrl) {
              setIsOpen(true);
            } else {
              await handleThumbnailUpload(imageFile);
            }
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
