import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeBlockNodeview } from "../NodeViews/CodeBlockHighlight";
import { ShikiPlugin } from "../CustomPlugins/ShikiPlugin";

export const CodeblockHighlight = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes }) => {
      return (
        <CodeBlockNodeview
          code={node.textContent}
          language={node.attrs.language || "plain"}
          updateAttributes={updateAttributes}
        />
      );
    });
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
      }),
    ];
  },
}).configure({ defaultLanguage: "javascript" });
