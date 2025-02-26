import { Plugin, PluginKey } from "@tiptap/pm/state";
import { slugify } from "@/lib/utils";

export const HeadingPlugin = () => {
  const headingPlugin = new Plugin({
    key: new PluginKey("headingPlugin"),

    // This runs after a transaction is applied
    appendTransaction(transactions, _, newState) {
      // Skip if no changes were made
      if (!transactions.some((tr) => tr.docChanged)) return null;

      const tr = newState.tr;
      let modified = false;

      // Process all headings in the document when changes occur
      newState.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          const newId = slugify(node.textContent);

          // Only update if ID needs to change
          if (node.attrs.id !== newId) {
            tr.setNodeAttribute(pos, "id", newId);
            modified = true; // Mark as modified so we return the transaction
          }
        }
      });

      return modified ? tr : null;
    },
  });

  return headingPlugin;
};
