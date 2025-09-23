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
