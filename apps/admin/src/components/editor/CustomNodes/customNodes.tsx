import { Node, mergeAttributes } from "@tiptap/react";
import { toggleNode } from "../CustomExtensions/toggleNode";

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
          .insertContent(`<section><h2></h2></section>`)
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

import { Selection } from "@tiptap/pm/state";
export const CustomBlockquote = Node.create({
  name: "customBlockquote",
  group: "block",
  content: "paragraph+ cite",
  selectable: true,
  defining: true,
  isolating: false,

  parseHTML() {
    return [{ tag: "blockquote" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["blockquote", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      toggleBlockquote:
        () =>
        ({ editor }) => {
          return toggleNode("customBlockquote", editor);
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { selection } = this.editor.state;
        const { $from, empty } = selection;
        if (!$from) return false;
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
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
        const endsWithDoubleNewline = $from.parent.textContent.endsWith("\n\n");

        if (!isAtEnd || !endsWithDoubleNewline) {
          return false;
        }

        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos);

            return true;
          })
          .exitCode()
          .run();
      },

      // exit node on arrow down
      ArrowDown: ({ editor }) => {
        
        const { state } = editor;
        const { selection, doc } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== this.type) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;

        if (!isAtEnd) {
          return false;
        }

        const after = $from.after();

        if (after === undefined) {
          return false;
        }

        const nodeAfter = doc.nodeAt(after);

        if (nodeAfter) {
          return editor.commands.command(({ tr }) => {
            tr.setSelection(Selection.near(doc.resolve(after)));
            return true;
          });
        }

        return editor.commands.exitCode();
      },
    };
  },
});
