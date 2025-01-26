import { uploadImage } from "@/actions/categoryActions";
import {
  NotificationType,
  useNotification,
} from "@/context/NotificationContext";
import React, { useEffect, useState } from "react";
import { FaX, FaImages } from "react-icons/fa6";

export default function ThumbnailModal({
  isOpen,
  onClose,
  currentThumbnail,
  blogLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentThumbnail?: string;
  blogLink: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentThumbnail) {
      setPreviewUrl(currentThumbnail);
    }
  }, [currentThumbnail]);
  const { addNotification } = useNotification();
  const onThumbnailChange = async (newThumbnail: File) => {
    const formData = new FormData();
    formData.append("file", newThumbnail);
    formData.append("blogLink", blogLink);
    const res = await uploadImage(formData,true);

    if (res.status === "success") {
      addNotification({
        message: "Thumbnail has been updated",
        type: NotificationType.SUCCESS,
      });
    } else {
      addNotification({
        message: "Failed to update thumbnail",
        type: NotificationType.ERROR,
      });
    }

    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onThumbnailChange(selectedFile);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-900/80">
      <div className="bg-neutral-800 rounded-lg shadow-2xl w-full max-w-3xl p-6 relative border border-neutral-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200"
        >
          <FaX size={24} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-neutral-100">
          Change Thumbnail
        </h2>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-neutral-600 rounded-lg p-6 hover:border-neutral-500 transition"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Thumbnail Preview"
                className="max-h-80 object-cover rounded-lg"
              />
            ) : (
              <>
                <FaImages size={48} className="text-neutral-500 mb-2" />
                <p className="text-neutral-400">Click to upload thumbnail</p>
              </>
            )}
          </label>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="flex-1 bg-neutral-600 text-neutral-100 py-2 rounded-lg hover:bg-neutral-500 disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            Change Thumbnail
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-neutral-700 text-neutral-300 py-2 rounded-lg hover:bg-neutral-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
