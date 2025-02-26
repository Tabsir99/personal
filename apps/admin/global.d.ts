import "@tiptap/core"; // Adjust this path if the package structure changes
import { useEditor } from "@tiptap/react";

type TipTapMarkType =
  | "bold"
  | "italic"
  | "code"
  | "strike"
  | "underline"
  | "link";

interface HeadingAttrs {
  level: number;
}

interface CodeBlockAttrs {
  language: string;
}

interface ImageAttrs {
  src: string;
  alt?: string;
  title?: string;
}

interface LinkAttrs {
  href: string;
  target?: string;
}

interface ListItemAttrs {
  checked?: boolean;
}

interface SectionAttrs {
  id: string;
}

declare module "@tiptap/core" {
  interface BaseNode {
    content?: JSONContent[]; // Default content structure for all nodes
    text?: string; // Default text (optional)
    key: string;
  }

  // Define node types
  type JSONContent =
    | (BaseNode & { type: "heading"; attrs?: HeadingAttrs })
    | (BaseNode & { type: "codeBlock"; attrs: CodeBlockAttrs })
    | (BaseNode & { type: "image"; attrs: ImageAttrs })
    | (BaseNode & { type: "listItem"; attrs?: ListItemAttrs })
    | (BaseNode & { type: "section"; attrs?: SectionAttrs })
    | (BaseNode & { type: "paragraph"; attrs?: never })
    | (BaseNode & { type: "horizontalRule"; attrs?: never })
    | (BaseNode & {
        type: "text";
        marks?: { type: TipTapMarkType; attrs: LinkAttrs; text?: string }[];
      })
    | (BaseNode & { type: "bulletList"; attrs?: never })
    | (BaseNode & { type: "orderedList"; attrs?: never })
    | (BaseNode & { type: "doc"; attrs?: never })
    | (BaseNode & { type: "lineBreak"; attrs?: never })
    | (BaseNode & { type: "customBlockquote"; attrs?: never })
    | (BaseNode & { type: "cite"; attrs?: never });

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
