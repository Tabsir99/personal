import "@tiptap/core"; // Adjust this path if the package structure changes
import { useEditor } from "@tiptap/react";

type BoldMark = {
  type: "bold";
  attrs: never;
  text?: string;
};

type ItalicMark = {
  type: "italic";
  attrs: never;
  text?: string;
};

type CodeMark = {
  type: "code";
  attrs: never;
  text?: string;
};

type StrikeMark = {
  type: "strike";
  attrs: never;
  text?: string;
};

type UnderlineMark = {
  type: "underline";
  attrs: never;
  text?: string;
};

type LinkMark = {
  type: "link";
  attrs: { href: string; target?: string };
  text?: string;
};

type TextColorMark = {
  type: "textColor";
  attrs: { color: string };
  text?: string;
};

type TipTapMarks =
  | BoldMark
  | ItalicMark
  | CodeMark
  | StrikeMark
  | UnderlineMark
  | LinkMark
  | TextColorMark;

interface HeadingAttrs {
  level: number;
}

interface CodeBlockAttrs {
  language: string;
}

interface ImageAttrs {
  src: string;
  alt: string;
  title?: string;
}

interface TextColorAttrs {
  color: string;
}

interface ListItemAttrs {
  checked?: boolean;
}

interface SectionAttrs {
  id: string;
}

type TextAttrs = TextColorAttrs | LinkAttrs;

declare module "@tiptap/core" {
  interface BaseNode {
    content?: JSONContent[]; // Default content structure for all nodes
    text?: string; // Default text (optional)
    key: string;
  }

  // Define node types
  type JSONContent =
    | (BaseNode & { type: "heading"; attrs: HeadingAttrs })
    | (BaseNode & { type: "codeBlock"; attrs: CodeBlockAttrs })
    | (BaseNode & {
        type: "image";
        attrs: ImageAttrs;
        marks?: TipTapMarks[];
      })
    | (BaseNode & { type: "listItem"; attrs: ListItemAttrs })
    | (BaseNode & { type: "section"; attrs: SectionAttrs })
    | (BaseNode & { type: "paragraph"; attrs: never })
    | (BaseNode & { type: "horizontalRule"; attrs: never })
    | (BaseNode & {
        type: "text";
        marks?: TipTapMarks[];
      })
    | (BaseNode & { type: "bulletList"; attrs: never })
    | (BaseNode & { type: "orderedList"; attrs: never })
    | (BaseNode & { type: "doc"; attrs: never })
    | (BaseNode & { type: "lineBreak"; attrs: never })
    | (BaseNode & { type: "customBlockquote"; attrs: never })
    | (BaseNode & { type: "cite"; attrs: never });

  interface Commands<ReturnType> {
    customCommands: {
      toggleTextColor: (color: string) => ReturnType;
      toggleBlockquote: () => ReturnType;
    };
    // textColor: {
    //   toggleTextColor: (color: string) => ReturnType;
    // };
    // customBlockquotes: {
    //   toggleBlockquote: () => ReturnType;
    // };
  }
}

// import { useEditor } from "@tiptap/react";
// useEditor()?.commands.customCommands.

export {};
