import { Mark, mergeAttributes } from "@tiptap/react";

export const TextColor = Mark.create({
  name: "textColor",
  exitable: true,
  inclusive: true,

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => ({
          style: `color: ${attributes.color}`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleTextColor:
        (color: string) =>
        ({ chain, state }) => {
          const { from, to } = state.selection;

          if (this.editor.isActive(this.name, { color })) {
            return chain().focus().unsetMark(this.name).run();
          }

          if (from === to) {
            return chain().focus().setMark(this.name, { color }).run();
          }

          return chain()
            .focus()
            .extendMarkRange(this.name)
            .setMark(this.name, { color })
            .run();
        },
    };
  },
  // addKeyboardShortcuts() {
  //   return {
  //     "Mod-l": () => {
  //       this.editor.chain().focus().setMark(this.type, { color: "#fff" }).run();
  //     },
  //   };
  // },
});
