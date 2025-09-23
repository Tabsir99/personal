import { JSONContent, type Editor } from "@tiptap/react";

export const toggleNode = (
  node: JSONContent["type"],
  editor: Editor,
  attrs: Record<string, any> | null = null
) => {
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
  const schemaNodes = Boolean(nodeType.spec.content)
    ? nodeType.spec
        .content!.replace(/[\+\*]/g, "")
        .split(" ")
        .map((schemaNode) => {
          if (schemaNode === "text") {
            return nodeContent || editor.schema.text(" ");
          }
          const type = editor.schema.nodes[schemaNode];

          return schemaNode === "paragraph" || schemaNode === "block"
            ? editor.schema.node("paragraph", null, nodeContent!)
            : type.createAndFill();
        })
    : null;

  const start = $from.before();
  const end = $from.after();

  tr.replaceWith(
    start,
    end,
    editor.schema.node(nodeType, attrs, schemaNodes as any)
  );

  if (!nodeContent) {
    const nodePos = start;
    const textPos = nodePos + 1;
    tr.insertText("", textPos, textPos + 1);
  }

  editor.view.dispatch(tr);
  editor.view.focus();
  return true;
};
