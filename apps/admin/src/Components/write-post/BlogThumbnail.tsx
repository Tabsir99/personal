import Image from "next/image";
import { useRef, useState } from "react";
import { MdUploadFile } from "react-icons/md";

import { uploadImage } from "@/actions/categoryActions";
import ConfirmationModal from "../ui/Components/ConfirmationModal";
import { useWriteBlogContext } from "@/context/WriteBlogContext";

export default function BlogThumbnailInput() {
  const { blogFormData, setBlogFormData } = useWriteBlogContext();
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleThumbnailUpload = async (image?: File) => {
    const formData = new FormData();
    formData.append("file", image || (thumbnail as any));
    formData.append(
      "blogLink",
      blogFormData.blogName.trim().toLowerCase().replace(/\s/g, "-")
    );
    const response = await uploadImage(formData, true);

    setBlogFormData((prev) => ({
      ...prev,
      featuredImageUrl: response.data as any,
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
        {blogFormData.featuredImageUrl
          ? "Change Thumbnail"
          : "Upload Thumbnail"}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const imageFile = e.target.files?.[0];

            if (!imageFile) return;
            setThumbnail(imageFile);
            if (blogFormData.featuredImageUrl) {
              setIsOpen(true);
            } else {
              await handleThumbnailUpload(imageFile);
            }
          }}
          className=" hidden"
        />
      </div>
      {blogFormData.featuredImageUrl && (
        <Image
          src={blogFormData.featuredImageUrl}
          alt="whatever"
          className="border-2 border-gray-700 rounded-lg"
          width={600}
          height={600}
        />
      )}
    </>
  );
}
