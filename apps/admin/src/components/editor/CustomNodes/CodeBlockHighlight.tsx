import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeBlockNodeview } from "../NodeViews/CodeBlockHighlight";
import { ShikiPlugin } from "../CustomPlugins/ShikiPlugin";

export const CodeblockHighlight = CodeBlock.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      defaultLanguage: null,
      HTMLAttributes: {},
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => {
      return (
        <CodeBlockNodeview
          code={node.textContent}
          language={node.attrs.language || "plain"}
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
});
