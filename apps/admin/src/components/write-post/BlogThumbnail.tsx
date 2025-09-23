import Image from "next/image";
import { useRef, useState } from "react";
import { MdUploadFile } from "react-icons/md";

import ConfirmationModal from "../ui/common/ConfirmationModal";
import { useBlogEditorStore } from "@/stores/BlogEditorStore";

export default function BlogThumbnailInput() {
  const featuredImageUrl = useBlogEditorStore(
    (state) => state.blogFormData.featuredImageUrl
  );
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleThumbnailUpload = async (image?: File) => {
    setIsOpen(false);
    image;
    thumbnail;
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
          "gap-1 w-fit cursor-pointer hover:bg-gray-700 text-white px-5 py-3 rounded flex items-center bg-zinc-800/70 "
        }
      >
        <MdUploadFile className="h-7 w-12" />{" "}
        {featuredImageUrl ? "Change Thumbnail" : "Upload Thumbnail"}
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const imageFile = e.target.files?.[0];

            if (!imageFile) return;
            setThumbnail(imageFile);
            if (featuredImageUrl) {
              setIsOpen(true);
            } else {
              await handleThumbnailUpload(imageFile);
            }
          }}
          className=" hidden"
        />
      </div>
      {featuredImageUrl && (
        <Image
          src={featuredImageUrl}
          alt="whatever"
          className="border-2 border-gray-700 rounded-lg"
          width={600}
          height={600}
        />
      )}
    </>
  );
}
