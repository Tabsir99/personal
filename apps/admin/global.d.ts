import "@tiptap/core";

declare module "@tiptap/core" {
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
    alt?: string;
    title?: string;
    caption?: string;
    width: number;
    height: number;
  }

  interface TextColorAttrs {
    color: string;
  }

  interface ListItemAttrs {
    checked?: boolean;
  }

  interface FaQSectionAttrs {
    id: string;
    question: string;
    answer: string;
  }

  type TextAttrs = TextColorAttrs | LinkAttrs;

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
    | (BaseNode & {
        type: "faqSection";
        attrs: { items: FaQSectionAttrs[]; title: string };
      })
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
    textColor: {
      toggleTextColor: (color: string) => ReturnType;
    };

    image: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
        caption?: string;
      }) => ReturnType;
    };
  }
}

export {};
