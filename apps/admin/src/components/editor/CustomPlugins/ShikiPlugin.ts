import { findChildren } from "@tiptap/core";
import { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

import {
  highlightCodeblock,
  RealtimeHighlightResult,
} from "@/config/highlighter";

function getDecorations({ doc, name }: { doc: ProsemirrorNode; name: string }) {
  const decorations: Decoration[] = [];

  findChildren(doc, (node) => node.type.name === name).forEach(
    async (block) => {
      let from = block.pos + 1;
      const language = block.node.attrs.language;

      const nodes = highlightCodeblock(
        block.node.textContent,
        language,
        true
      ) as RealtimeHighlightResult[];

      nodes.forEach((node) => {
        const to = from + node.text.length;

        if (node.style.length) {
          const decoration = Decoration.inline(from, to, {
            style: node.style,
          });

          decorations.push(decoration);
        }

        from = to;
      });
    }
  );

  return DecorationSet.create(doc, decorations);
}

export function ShikiPlugin({ name }: { name: string }) {
  const shikiPlugin: Plugin<any> = new Plugin({
    key: new PluginKey("shiki"),

    state: {
      init: (_, { doc }) =>
        getDecorations({
          doc,
          name,
        }),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name;
        const newNodeName = newState.selection.$head.parent.type.name;
        const oldNodes = findChildren(
          oldState.doc,
          (node) => node.type.name === name
        );
        const newNodes = findChildren(
          newState.doc,
          (node) => node.type.name === name
        );

        if (
          transaction.docChanged &&
          // Apply decorations if:
          // selection includes named node,
          ([oldNodeName, newNodeName].includes(name) ||
            // OR transaction adds/removes named node,
            newNodes.length !== oldNodes.length ||
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            transaction.steps.some((step) => {
              // @ts-ignore
              return (
                // @ts-ignore
                step.from !== undefined &&
                // @ts-ignore
                step.to !== undefined &&
                oldNodes.some((node) => {
                  // @ts-ignore
                  return (
                    // @ts-ignore
                    node.pos >= step.from &&
                    // @ts-ignore
                    node.pos + node.node.nodeSize <= step.to
                  );
                })
              );
            }))
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
          });
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },

    props: {
      decorations(state) {
        return shikiPlugin.getState(state);
      },
    },
  });

  return shikiPlugin;
}
