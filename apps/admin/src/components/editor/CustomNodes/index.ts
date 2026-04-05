import { CodeblockHighlight } from "./CodeBlockHighlight";
import { RootNode, MainSection, LineBreak } from "../CustomNodes/customNodes";
import type { Editor } from "@tiptap/core";

// For leaf nodes only
export const exitOnArrowDown = ({
  editor,
  nodeType,
}: {
  editor: Editor;
  nodeType: string;
}) => {
  const { state } = editor;
  const { selection, doc } = state;
  const { $from } = selection;

  const currentNode = doc.nodeAt($from.pos)?.type.name;

  if (currentNode !== nodeType) {
    return false;
  }

  const isAtEnd = $from.pos === doc.nodeSize - 4;

  if (!isAtEnd) {
    return false;
  }

  editor.commands.insertContentAt($from.pos + 1, { type: "paragraph" });
  return true;
};

export { CodeblockHighlight, RootNode, MainSection, LineBreak };
