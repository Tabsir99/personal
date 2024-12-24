import { Editor } from "@tiptap/react";
import { useState } from "react";

const LinkModal = ({
  onClose,
  isOpen,
  editor,
}: {
  onClose: () => void;
  isOpen: boolean;
  editor: Editor;
}) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  function onInsertLink(url: string, text: string) {
    if (url && text) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank", class: "links" })
        .insertContent(text)
        .run();
    }
  }

  const handleInsert = () => {
    onInsertLink(url, text);
    setUrl("");
    setText("");
    onClose();
  };

  return (
    <div
      className={
        "bg-gray-800 top-[21%] left-[40%] fixed pt-12 pb-8 px-10 rounded-lg w-96 origin-top transition duration-200 overflow-hidden " +
        (isOpen ? "" : "scale-y-50 -z-10 opacity-0")
      }
    >
      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border-2 bg-transparent border-gray-700 focus:border-green-600 outline-none rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Text"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border-2 bg-transparent border-gray-700 outline-none focus:border-green-600 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link"
        />
      </div>

      <div className="flex justify-end">
        <button
          className="mr-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-green-700 text-gray-300 hover:bg-green-600 rounded-md"
          onClick={handleInsert}
        >
          Insert
        </button>
      </div>
    </div>
  );
};

export default LinkModal;
