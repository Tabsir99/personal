import { PreviewCodeBlock } from "@/components/editor/NodeViews/CodeBlockHighlight";
import { highlightCodeblock } from "@/config/highlighter";
import { JSONContent } from "@tiptap/react";
import { Fragment } from "react";

export const parseContent = (content: JSONContent | null): React.ReactNode => {
  // Handle empty content
  if (!content) return null;

  // Text nodes are handled specially
  if (content.type === "text") {
    const text = content.text || "";
    // If there are marks, wrap the text with appropriate components
    if (content.marks?.length) {
      return content.marks.reduce((node, mark) => {
        switch (mark.type) {
          case "bold":
            return <strong>{node}</strong>;
          case "italic":
            return <em>{node}</em>;
          case "code":
            return <code>{node}</code>;
          case "strike":
            return <s>{node}</s>;
          case "underline":
            return <u>{node}</u>;
          case "link":
            return (
              <a href={mark.attrs.href} target={mark.attrs.target || "_blank"}>
                {node}
              </a>
            );
          default:
            return node;
        }
      }, text);
    }
    return text;
  }

  // Parse child content recursively
  const children = content.content?.map((child, index) => (
    <Fragment key={`${child.type}-${index}`}>
      {parseContent({ ...child, key: `${content.type}-${index}` })}
    </Fragment>
  ));

  // Handle each node type
  switch (content.type) {
    case "paragraph":
      return <p>{children}</p>;

    case "heading":
      const HeadingTag =
        `h${content.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
      return <HeadingTag>{children}</HeadingTag>;

    case "bulletList":
      return <ul>{children}</ul>;

    case "orderedList":
      return <ol>{children}</ol>;

    case "listItem":
      return <li>{children}</li>;

    case "horizontalRule":
      return <hr />;

    case "codeBlock":
      const codeContent =
        content.content?.map((child) => child.text || "").join("\n") || "";
      const highlightCode = highlightCodeblock(
        codeContent,
        content.attrs.language,
        false
      ) as string;
      return (
        <PreviewCodeBlock
          codeHtml={highlightCode}
          language={content.attrs.language}
          code={codeContent}
        />
      );

    case "image":
      return (
        <img
          src={content.attrs.src}
          alt={content.attrs?.alt}
          title={content.attrs?.title}
        />
      );

    case "section":
      return <section>{children}</section>;

    case "lineBreak":
      return <br />;

    case "customBlockquote":
      return <blockquote>{children}</blockquote>;

    case "cite":
      return <cite>{children}</cite>;

    default:
      console.warn(`Unknown node type: ${content}`);
      return children || null;
  }
};
