import type { Editor } from "@tiptap/react";

export const toggleNode = (node: string, editor: Editor) => {
  const { selection, tr } = editor.view.state;
  const { $from } = selection;
  const nodeType = editor.schema.nodes[node];
  const currentNode = $from.parent;
  const text = currentNode.textContent;
  const nodeContent = text ? editor.schema.text(text) : null;

  if ($from.node(2).type.name === nodeType.name) {
    // Get the position before and after the node we want to replace
    const start = $from.before(2);
    const end = $from.after(2);

    // Create a new paragraph with the existing content
    const newParagraph = editor.schema.nodes.paragraph.create(
      null,
      nodeContent ? [nodeContent] : undefined
    );

    tr.replaceWith(start, end, newParagraph);

    editor.view.dispatch(tr);
    editor.view.focus();
    return true;
  }

  // Rest of the code for setting the node remains the same
  const schemaNodes = nodeType.spec
    .content!.replace(/[\+\*]/g, "")
    .split(" ")
    .map((schemaNode) => {
      const type = editor.schema.nodes[schemaNode];
      return schemaNode === "paragraph" || schemaNode === "block"
        ? editor.schema.node("paragraph", null, nodeContent!)
        : type.createAndFill();
    });

  const start = $from.before();
  const end = $from.after();
  tr.replaceWith(
    start,
    end,
    editor.schema.node(nodeType, null, schemaNodes as any)
  );

  editor.view.dispatch(tr);
  editor.view.focus();
  return true;
};
