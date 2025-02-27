import { Node, ReactNodeViewRenderer } from "@tiptap/react";
import { ImageBlockNodeview } from "../NodeViews/NextImage";

export const ImageExtension = Node.create({
  name: "image",

  // Basic configuration
  group: "block",
  content: "",
  draggable: true,
  isolating: true,

  // Define attributes to store in the document schema
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: 800,
      },
      height: {
        default: 800,
      },
      caption: {
        default: null,
      },
    };
  },

  // Basic HTML parsing to extract attributes from existing HTML
  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          if (typeof dom === "string") return {};
          const element = dom as HTMLImageElement;
          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            width: element.getAttribute("width")
              ? parseInt(element.getAttribute("width") || "0", 10)
              : 800,
            height: element.getAttribute("height")
              ? parseInt(element.getAttribute("height") || "0", 10)
              : 800,
          };
        },
      },
    ];
  },

  // Just a minimal HTML output for the editor - your custom component will handle the actual rendering
  renderHTML({ HTMLAttributes }) {
    return ["img", HTMLAttributes];
  },

  // Command to insert an image
  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  // Your custom component will handle the rendering
  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockNodeview);
  },
});
