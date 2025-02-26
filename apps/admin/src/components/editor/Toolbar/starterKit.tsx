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
import Text from "@tiptap/extension-text";

import {
  RootNode,
  MainSection,
  LineBreak,
  Cite,
  CustomBlockquote,
  CodeblockHighlight,
} from "../CustomNodes";

import { TextColor } from "../CustomMarks/customMarks";

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

export const starterKitOptions = [
  RootNode,
  MainSection,
  CustomBlockquote,
  Bold,
  BulletList,
  Code,
  CodeblockHighlight,
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
