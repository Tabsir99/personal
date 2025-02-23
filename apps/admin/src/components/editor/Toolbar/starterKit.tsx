import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import Dropcursor from "@tiptap/extension-dropcursor";
import Heading from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight, {
  CodeBlockLowlightOptions,
} from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";

import {
  RootNode,
  MainSection,
  LineBreak,
  Cite,
  CustomBlockquote,
} from "../CustomNodes/customNodes";
import Text from "@tiptap/extension-text";
import { TextColor } from "../CustomMarks/customMarks";

const lowlight = createLowlight();
lowlight.register("javascript", js);
lowlight.register("rust", rust);
lowlight.register("java", java);
lowlight.register("typescript", typescript);
lowlight.register("python", python);

const CustomTextAlign = TextAlign.configure({
  types: ["paragraph", "heading", "listItem"],
  alignments: ["left", "center", "right", "justify"],
});

const CustomLink = Link.extend({
  exitable: true,
  inclusive: false,
});
const CustomUnderLine = Underline.extend({
  exitable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "underline",
      },
    };
  },
});

const CustomCodeBlock = CodeBlockLowlight.extend<
  CodeBlockLowlightOptions & { style?: string }
>({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) =>
          attributes.style ? { style: attributes.style } : {},
      },
    };
  },
});

export const starterKitOptions = [
  RootNode,
  MainSection,
  CustomBlockquote,
  Bold,
  BulletList,
  Code,
  CustomCodeBlock.configure({
    lowlight,
  }),
  Dropcursor,
  Heading,
  History,
  HorizontalRule,
  Italic,
  ListItem,
  OrderedList,
  Paragraph,
  Strike,
  CustomUnderLine,
  CustomTextAlign,
  CustomLink,
  Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        loading: {
          default: "lazy",
          parseHTML: (element) => element.getAttribute("loading"),
          renderHTML: (attributes) =>
            attributes.loading ? { loading: attributes.loading } : {},
        },
        class: {
          default:
            "border-2 border-gray-700 rounded-md hover:scale-[1.03] transition-transform duration-200 cursor-pointer",
          parseHTML: (element) => element.getAttribute("class"),
          renderHTML: (attributes) =>
            attributes.loading ? { class: attributes.class } : {},
        },
      };
    },
  }),
  Text,
  LineBreak,
  Cite,
  TextColor,
];
