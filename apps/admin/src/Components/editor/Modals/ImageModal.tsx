import { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { FaLink, FaUpload } from "react-icons/fa";

import { uploadImage } from "@/actions/categoryActions";

export const ImageModal = ({
  onClose,
  isOpen,
  editor,
}: {
  onClose: () => void;
  isOpen: boolean;
  editor: Editor;
}) => {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [uploadAlt, setUploadAlt] = useState({
    show: false,
    text: "",
    url: "",
  });
  const [showModal, setShowModal] = useState(false);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  function onImageSubmit(src: string, alt: string) {
    if (src && alt) {
      editor.chain().focus().setImage({ src: src, alt: alt }).run();
    }
  }
  const handleSubmit = () => {
    onImageSubmit(src, alt);
    setSrc("");
    setAlt("");
    setShowModal(false);
    setUploadAlt({
      show: false,
      text: "",
      url: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="flex fixed top-32 right-96 border-2 border-gray-700 z-50 flex-col p-3 gap-1 bg-gray-800 w-fit rounded-md">
        <button
          className="flex gap-2 px-3 py-2 hover:bg-gray-700 rounded-md"
          onClick={() => setShowModal(true)}
        >
          Insert By URL <FaLink className="w-5 h-5" />
        </button>
        <button
          className="flex gap-2 px-3 py-2 hover:bg-gray-700 rounded-md "
          onClick={() => {
            uploadRef.current?.click();
          }}
        >
          Upload from device <FaUpload className="w-5 h-5" />
        </button>

        <input
          type="file"
          className="hidden"
          ref={uploadRef}
          accept="image/*"
          onChange={async (e) => {
            const imageFile = e.target.files?.[0];

            const { blogName } = JSON.parse(
              localStorage.getItem("metaData") || ""
            );
            const id = blogName.toLowerCase().replace(/\s/g, "-");

            const formData = new FormData();
            formData.append("file", imageFile!);
            formData.append("category", id);
            const response = await uploadImage(formData);

            setUploadAlt((prev) => ({
              ...prev,
              show: true,
              url: response.data!,
            }));
          }}
        />

        {uploadAlt.show && (
          <div className="mb-4 flex flex-col gap-2">
            <input
              type="text"
              id="alt"
              className="mt-1 block w-full p-2 outline-none bg-transparent border-b-2 border-green-700 shadow-sm focus:border-green-500 text-gray-200"
              value={uploadAlt.text}
              placeholder="Enter Alt text"
              onChange={(e) =>
                setUploadAlt((prev) => ({ ...prev, text: e.target.value }))
              }
            />
            <button
              onClick={() => {
                onImageSubmit(uploadAlt.url, uploadAlt.text);
                onClose();
              }}
              className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 focus:outline-none focus:ring focus:ring-green-500 focus:ring-opacity-50"
            >
              Insert
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 h-screen w-screen bg-opacity-45 bg-black flex justify-center items-center z-50">
          <div className=" bg-gray-800 w-[35%] h-[45%] rounded-lg p-12 shadow-md flex flex-col gap-1 justify-around">
            <h3 className="text-xl text-gray-300 mb-4">Insert Image</h3>
            <div className="mb-4">
              <input
                type="url"
                id="src"
                className="mt-1 block w-full p-2 bg-transparent border-b-2 border-green-700 shadow-sm outline-none focus:border-green-500 text-gray-200"
                value={src}
                placeholder="Enter Image URL"
                onChange={(e) => setSrc(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                id="alt"
                className="mt-1 block w-full p-2 outline-none bg-transparent border-b-2 border-green-700 shadow-sm focus:border-green-500 text-gray-200"
                value={alt}
                placeholder="Enter Alt text"
                onChange={(e) => setAlt(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-500 focus:ring-opacity-50 ml-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 focus:outline-none focus:ring focus:ring-green-500 focus:ring-opacity-50"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
