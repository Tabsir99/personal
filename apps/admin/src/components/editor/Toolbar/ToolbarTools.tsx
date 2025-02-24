import { Level } from "@tiptap/extension-heading";
import { Editor } from "@tiptap/react";
import { Dispatch, SetStateAction } from "react";
import {
  FaArrowRotateLeft,
  FaArrowRotateRight,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaLink,
  FaImage,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaTextHeight,
} from "react-icons/fa6";

import { ActiveModal } from "../Editor";
import HeadingModal from "../Modals/HeadingModal";

export const getTools = (
  editor: Editor,
  setActiveModal: Dispatch<SetStateAction<ActiveModal>>
) => [
  {
    icon: <FaArrowRotateLeft />,
    key: "undo",
    command: () => editor.chain().focus().undo().run(),
  },
  {
    icon: <FaArrowRotateRight />,
    key: "redo",
    command: () => editor.chain().focus().redo().run(),
  },
  { type: "divider", key: "divider-1" },
  {
    component: (
      <HeadingModal
        key="dropdown"
        command={(level: Level) =>
          editor.chain().focus().toggleHeading({ level }).run()
        }
      />
    ),
  },
  { type: "divider", key: "divider-2" },
  {
    icon: <FaBold />,
    key: "bold",
    command: () => editor.chain().focus().toggleBold().run(),
    activeType: "format",
  },
  {
    icon: <FaItalic />,
    key: "italic",
    command: () => editor.chain().focus().toggleItalic().run(),
    activeType: "format",
  },
  {
    icon: <FaUnderline />,
    key: "underline",
    command: () => editor.chain().focus().toggleUnderline().run(),
    activeType: "format",
  },
  {
    icon: <FaStrikethrough />,
    key: "strikethrough",
    command: () => editor.chain().focus().toggleStrike().run(),
    activeType: "format",
  },

  {
    icon: <FaTextHeight />,
    key: "highlighter",
    command: () =>
      setActiveModal((prev) => ({
        link: false,
        image: false,
        textColor: !prev.textColor,
        programmingLanguage: false,
      })),
    activeType: "color",
  },

  {
    icon: <span className="font-extrabold">hr</span>,
    key: "horizontal",
    command: () => editor.chain().focus().setHorizontalRule().run(),
    activeType: "format",
  },

  { type: "divider", key: "divider-3" },
  {
    icon: <FaLink />,
    key: "link",
    command: () =>
      setActiveModal((prev) => ({
        link: !prev.link,
        image: false,
        textColor: false,
        programmingLanguage: false,
      })),
  },
  {
    icon: <FaImage />,
    key: "image",
    command: () =>
      setActiveModal((prev) => ({
        link: false,
        image: !prev.image,
        textColor: false,
        programmingLanguage: false,
      })),
  },
  { type: "divider", key: "divider-4" },
  {
    icon: <FaAlignLeft />,
    key: "left",
    command: () => editor.chain().focus().setTextAlign("left").run(),
    activeType: "align",
  },
  {
    icon: <FaAlignCenter />,
    key: "center",
    command: () => editor.chain().focus().setTextAlign("center").run(),
    activeType: "align",
  },
  {
    icon: <FaAlignRight />,
    key: "right",
    command: () => editor.chain().focus().setTextAlign("right").run(),
    activeType: "align",
  },
  {
    icon: <FaAlignJustify />,
    key: "justify",
    command: () => editor.chain().focus().setTextAlign("justify").run(),
    activeType: "align",
  },
  { type: "divider", key: "divider-5" },
  {
    icon: <FaListUl />,
    key: "ul",
    command: () => editor.chain().focus().toggleBulletList().run(),
    activeType: "block",
  },
  {
    icon: <FaListOl />,
    key: "ol",
    command: () => editor.chain().focus().toggleOrderedList().run(),
    activeType: "block",
  },
  {
    icon: <FaQuoteLeft />,
    key: "quote",
    command: () => {
      // THis one works but cant handle specific schema for the custom node
      // editor.chain().focus().toggleWrap("customBlockquote").run()

      editor.chain().focus().toggleBlockquote()
      ;
    },
    activeType: "block",
  },
  {
    icon: <FaCode />,
    key: "code",
    command: () => {
      setActiveModal((prev) => ({ ...prev, programmingLanguage: true }));
    },
    activeType: "block",
  },
];
