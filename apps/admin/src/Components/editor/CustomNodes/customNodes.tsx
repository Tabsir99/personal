import { Node, mergeAttributes } from "@tiptap/react";

export const MainSection = Node.create({
  name: "section",
  group: "special",
  content: "block+",

  parseHTML() {
    return [
      {
        tag: "section",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes), 0];
  },
  addKeyboardShortcuts() {
    return {
      "ctrl-Enter": () => {
        this.editor
          .chain()
          .insertContent("<section><p></p></section>")
          .focus()
          .run();
        return true;
      },
    };
  },
});

export const RootNode = Node.create({
  name: "doc",
  content: "special+",
  topNode: true,
});

export const LineBreak = Node.create({
  name: "lineBreak",
  inline: true,
  group: "inline",
  atom: true,
  selectable: false,
  renderHTML() {
    return ["br"];
  },
  parseHTML() {
    return [{ tag: "br" }];
  },
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": () => {
        this.editor.chain().focus().insertContent("<br/>").run();
        return true;
      },
    };
  },
});

export const Cite = Node.create({
  name: "cite",
  group: "block",
  content: "inline*",
  renderHTML({ HTMLAttributes }) {
    return ["cite", mergeAttributes(HTMLAttributes), 0];
  },
  parseHTML() {
    return [
      {
        tag: "cite",
      },
    ];
  },
});

export const CustomBlockquote = Node.create({
  name: "customBlockquote",

  group: "block",

  content: "paragraph+ cite", // Your custom content structure

  selectable: true,

  defining: true,

  isolating: false,
  parseHTML() {
    return [{ tag: "blockquote" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["blockquote", HTMLAttributes, 0];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from, empty } = selection;
        if(!$from) return false
        if (!$from.node(2)) return false;
        if ($from.node(2).type.name !== this.type.name) {
          return false;
        }
        if (
          !empty ||
          $from.parent.type.name !== "paragraph" ||
          $from.node($from.depth - 1).childCount > 2
        ) {
          return false;
        }

        if ($from.parent.content.size === 0) {
          const tr = this.editor.state.tr.replaceWith(
            $from.before($from.depth - 1),
            $from.after($from.depth - 1),
            this.editor.schema.nodes.paragraph.createAndFill()!
          );
          this.editor.view.dispatch(tr);
          return true;
        }

        return false;
      },
      Enter: ({ editor }) => {
        const { selection } = editor.view.state;
        const { $from, empty } = selection;
        if (!$from.node(2)) return false;

        if ($from.node(2).type.name !== this.type.name) {
          return false;
        }
        const tr = editor.view.state.tr;

        const currentParent = $from.parent;
        const parentNodeType = currentParent.type.name;

        if (parentNodeType === "cite") {
          const pos = $from.after($from.depth - 1);
          const newTr = tr.replaceWith(
            pos,
            pos,
            editor.schema.nodes.paragraph.createAndFill()!
          );

          editor.view.dispatch(
            newTr.setSelection(
              // editor.state.selection.constructor.near(newTr.doc.resolve(pos))
              "" as any
            )
          );
          return true;
        }

        if (empty && parentNodeType === "paragraph") {
          if (currentParent.textContent === "") {
            tr.delete($from.pos - 1, $from.pos);
            editor.view.dispatch(tr);
            return true;
          } else {
            tr.split($from.pos);
            editor.view.dispatch(tr);
            return true;
          }
        }

        return false;
      },
    };
  },

  
  // addCommands() {
  //   return {
  //     toggleCustomBlockquote: () => {
  //       const editor = this.editor;
  //       const { state, dispatch } = editor.view;
  //       const { selection } = state;
  //       const { $from, $to } = selection;
  //       const nodeType = editor.schema.nodes.customBlockquote;
  //       const paragraphType = editor.schema.nodes.paragraph;

  //       const isCustomBlockquote = $from.node($from.depth).type === nodeType;

  //       if (isCustomBlockquote) {
  //         const currentBlockquote = $from.node($from.depth - 1);

  //         // Check if we have multiple paragraphs inside the blockquote
  //         if (currentBlockquote.childCount > 2) {
  //           const { from, to } = selection;
  //           const paragraphIndex = $from.index($from.depth) + 1;
  //           const paragraphPos =
  //             $from.start($from.depth) +
  //             currentBlockquote.content.child(paragraphIndex - 1).nodeSize;

  //           if (paragraphIndex < currentBlockquote.childCount) {
  //             // Move the current paragraph outside of the blockquote
  //             const tr = state.tr.split(paragraphPos).delete(from, to);
  //             tr.insert(
  //               paragraphPos,
  //               paragraphType.createAndFill(
  //                 null,
  //                 $from.node($from.depth).content
  //               )!
  //             );
  //             dispatch(tr);
  //           } else {
  //             // Remove the blockquote if it's the last paragraph
  //             const tr = state.tr.replaceWith(
  //               $from.before($from.depth),
  //               $to.after($to.depth),
  //               paragraphType.createAndFill(null, currentBlockquote.content)!
  //             );
  //             dispatch(tr);
  //           }
  //         } else {
  //           // Remove the blockquote entirely
  //           const tr = state.tr.replaceWith(
  //             $from.before($from.depth),
  //             $to.after($to.depth),
  //             paragraphType.createAndFill(null, currentBlockquote.content)!
  //           );
  //           dispatch(tr);
  //         }

  //         return true;
  //       } else {
  //         // Convert to customBlockquote
  //         const tr = state.tr.replaceWith(
  //           $from.before(),
  //           $to.after(),
  //           nodeType.createAndFill(null, $from.node($from.depth).content)!
  //         );
  //         dispatch(tr);
  //         return true;
  //       }
  //     },
  //   };
  // },
});


