"use client";

import { Editor } from "@tiptap/react";
import {
  Dispatch,
  SetStateAction,
  cloneElement,
  useEffect,
  useState,
} from "react";

import { ActiveModal } from "../Editor";

import { getTools } from "./ToolbarTools";

const Toolbar = ({
  editor,
  setActiveModal,
  activeTextColor,
  setActiveTextColor,
}: {
  editor: Editor;
  setActiveModal: Dispatch<SetStateAction<ActiveModal>>;
  activeTextColor: string;
  setActiveTextColor: Dispatch<SetStateAction<string>>;
}) => {
  const buttonClass =
    " toolbar-btns px-2 py-2 rounded-md hover:bg-zinc-300/10 transition duration-100 active:scale-95 ";

  const [activeButton, setActiveButton] = useState({
    align: "left",
    block: "",
    format: {},
  });

  const updateActiveButton = () => {
    setActiveButton({
      format: {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strikethrough: editor.isActive("strike"),
      },
      align: editor.isActive({ textAlign: "right" })
        ? "right"
        : editor.isActive({ textAlign: "center" })
          ? "center"
          : editor.isActive({ textAlign: "justify" })
            ? "justify"
            : "left",
      block: editor.isActive("bulletList")
        ? "ul"
        : editor.isActive("orderedList")
          ? "ol"
          : editor.isActive("blockquote")
            ? "quote"
            : editor.isActive("codeBlock")
              ? "code"
              : "",
    });

    const textColor = editor.getAttributes("textColor").color || "#D1D5DB";
    setActiveTextColor(textColor);
  };
  useEffect(() => {
    editor.on("selectionUpdate", updateActiveButton);

    return () => {
      editor.off("selectionUpdate", updateActiveButton);
    };
  }, [editor, updateActiveButton]);

  const tools = getTools(editor, setActiveModal);
  return (
    <>
      {tools.map((item) =>
        item.type === "divider" ? (
          <div className="border-r border-gray-300 mx-2 h-6" key={item.key} />
        ) : item.component ? (
          cloneElement(item.component, { key: item.key })
        ) : item.activeType === "color" ? (
          <button
            className={buttonClass + " w-8 h-8 relative"}
            id={item.key}
            key={item.key}
            onClick={() => {
              item.command();
              updateActiveButton();
            }}
          >
            <span className="absolute font-bold text-base top-[3px] left-1/2 -translate-x-1/2">
              A
            </span>
            <span
              aria-hidden
              className="w-[70%] left-1/2 -translate-x-1/2 h-[3px] rounded-full block absolute bottom-1"
              style={{
                backgroundColor: activeTextColor,
              }}
            ></span>
          </button>
        ) : (
          <button
            className={buttonClass}
            id={item.key}
            key={item.key}
            data-active={
              (item.activeType === "align" &&
                activeButton.align === item.key) ||
              (item.activeType === "block" &&
                activeButton.block === item.key) ||
              (item.activeType === "format" && activeButton.format[item.key])
            }
            onClick={() => {
              if (item.command) {
                item.command();
              }
              if (item.key === "undo" || item.key === "redo") return;

              updateActiveButton();
            }}
          >
            {item.icon}
          </button>
        )
      )}
    </>
  );
};

export default Toolbar;
