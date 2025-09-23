import { Editor } from "@tiptap/react";
import {
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
} from "react-icons/fa6";

interface Tool {
  icon?: React.ReactNode;
  key: string;
  command?: () => void;
  type:
    | "history"
    | "divider"
    | "heading"
    | "image"
    | "link"
    | "textColor"
    | "components"
    | "mark"
    | "node"
    | "align";
}
export const getTools = (editor: Editor): Tool[] => [
  {
    icon: <FaArrowRotateLeft />,
    key: "undo",
    command: () => editor.chain().focus().undo().run(),
    type: "history",
  },
  {
    icon: <FaArrowRotateRight />,
    key: "redo",
    command: () => editor.chain().focus().redo().run(),
    type: "history",
  },
  { type: "divider", key: "divider-1" },
  { type: "heading", key: "heading" },
  { type: "divider", key: "divider-2" },
  {
    icon: <FaBold />,
    key: "bold",
    command: () => editor.chain().focus().toggleBold().run(),
    type: "mark",
  },
  {
    icon: <FaItalic />,
    key: "italic",
    command: () => editor.chain().focus().toggleItalic().run(),
    type: "mark",
  },
  {
    icon: <FaUnderline />,
    key: "underline",
    command: () => editor.chain().focus().toggleUnderline().run(),
    type: "mark",
  },
  {
    icon: <FaStrikethrough />,
    key: "strikethrough",
    command: () => editor.chain().focus().toggleStrike().run(),
    type: "mark",
  },

  { key: "textColor", type: "textColor" },

  {
    icon: <span className="font-extrabold">hr</span>,
    key: "horizontal",
    command: () => editor.chain().focus().setHorizontalRule().run(),
    type: "mark",
  },

  { type: "divider", key: "divider-3" },
  { key: "link", type: "link" },

  { key: "image", type: "image" },
  { type: "divider", key: "divider-4" },

  {
    icon: <FaAlignLeft />,
    key: "left",
    command: () => editor.chain().focus().setTextAlign("left").run(),
    type: "align",
  },
  {
    icon: <FaAlignCenter />,
    key: "center",
    command: () => editor.chain().focus().setTextAlign("center").run(),
    type: "align",
  },
  {
    icon: <FaAlignRight />,
    key: "right",
    command: () => editor.chain().focus().setTextAlign("right").run(),
    type: "align",
  },
  {
    icon: <FaAlignJustify />,
    key: "justify",
    command: () => editor.chain().focus().setTextAlign("justify").run(),
    type: "align",
  },
  { type: "divider", key: "divider-5" },
  {
    icon: <FaListUl />,
    key: "ul",
    command: () => editor.chain().focus().toggleBulletList().run(),
    type: "node",
  },
  {
    icon: <FaListOl />,
    key: "ol",
    command: () => editor.chain().focus().toggleOrderedList().run(),
    type: "node",
  },
  {
    icon: <FaQuoteLeft />,
    key: "quote",
    command: () => {
      editor.chain().focus().toggleBlockquote();
    },
    type: "node",
  },
  { key: "Components", type: "components" },
];
