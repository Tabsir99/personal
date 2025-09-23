import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { toggleNode } from "../CustomExtensions/toggleNode";
import FAQSectionView from "../NodeViews/FaqNodeview";
import { exitOnArrowDown } from ".";

export interface FAQSectionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    faqSection: {
      /**
       * Toggle FAQ section
       */
      toggleFAQSection: () => ReturnType;
      /**
       * Add new FAQ item
       */
      addFAQItem: (item: Omit<FaQSectionAttrs, "id">) => ReturnType;
      /**
       * Update FAQ item
       */
      updateFAQItem: (item: FaQSectionAttrs) => ReturnType;
      /**
       * Remove FAQ item
       */
      removeFAQItem: (id: string) => ReturnType;
    };
  }
}

export const FAQSection = Node.create<FAQSectionOptions>({
  name: "faqSection",

  // Define this node as a block element that isn't inline
  group: "block",
  content: "", // This node doesn't contain other nodes
  isolating: true, // Content from outside cannot move into this node

  // Define default attributes

  addAttributes() {
    return {
      items: {
        default: [
          {
            id: crypto.randomUUID(),
            question: "What is this?",
            answer: "This is an FAQ item.",
          },
        ],
        parseHTML: (element) => {
          const itemsData = element.getAttribute("data-items");
          if (itemsData) {
            try {
              return JSON.parse(itemsData);
            } catch (e) {
              console.error("Failed to parse FAQ items", e);
              return [];
            }
          }
          return [];
        },
        renderHTML: (attributes) => {
          return {
            "data-items": JSON.stringify(attributes.items),
          };
        },
      },
      title: {
        default: "Frequently Asked Questions",
        parseHTML(element) {
          const h = element.getAttribute("data-title");
          return h;
        },
        renderHTML(attributes) {
          return {
            "data-title": attributes.title,
          };
        },
      },
    };
  },

  // Define how this node is parsed from HTML
  parseHTML() {
    return [
      {
        tag: 'div[data-type="faq-section"]',
      },
    ];
  },

  // Define how this node is rendered to HTML
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "faq-section" }, HTMLAttributes),
      0,
    ];
  },

  // Add commands to the editor
  addCommands() {
    return {
      toggleFAQSection:
        () =>
        ({ editor }) => {
          return toggleNode("faqSection", editor);
        },

      addFAQItem:
        (item) =>
        ({ commands, editor }) => {
          const { selection } = editor.state;
          const node = editor.state.doc.nodeAt(selection.anchor);

          if (!node || node.type.name !== "faqSection") {
            return false;
          }

          const items = [...node.attrs.items];
          const newItem = {
            id: crypto.randomUUID(),
            ...item,
          };

          return commands.updateAttributes("faqSection", {
            items: [...items, newItem],
          });
        },

      updateFAQItem:
        (item) =>
        ({ commands, editor }) => {
          const { selection } = editor.state;
          const node = editor.state.doc.nodeAt(selection.anchor);

          if (!node || node.type.name !== "faqSection") {
            return false;
          }

          const items = [...node.attrs.items];
          const index = items.findIndex((i) => i.id === item.id);

          if (index === -1) {
            return false;
          }

          items[index] = item;

          return commands.updateAttributes("faqSection", {
            items,
          });
        },

      removeFAQItem:
        (id) =>
        ({ commands, editor }) => {
          const { selection } = editor.state;
          const node = editor.state.doc.nodeAt(selection.anchor);

          if (!node || node.type.name !== "faqSection") {
            return false;
          }

          const items = [...node.attrs.items];
          const newItems = items.filter((item) => item.id !== id);

          // Don't remove the last item
          if (newItems.length === 0) {
            return false;
          }

          return commands.updateAttributes("faqSection", {
            items: newItems,
          });
        },
    };
  },

  // Add keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-q": () => this.editor.commands.toggleFAQSection(),
      ArrowDown: ({ editor }) =>
        exitOnArrowDown({ editor, nodeType: this.name }),
    };
  },

  // Add the node view renderer
  addNodeView() {
    return ReactNodeViewRenderer(FAQSectionView);
  },
});

export default FAQSection;
