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
import Text from "@tiptap/extension-text";
import Blockquote from "@tiptap/extension-blockquote";
import { Extensions } from "@tiptap/core";

import {
  RootNode,
  MainSection,
  LineBreak,
  CodeblockHighlight,
} from "../CustomNodes";

import { TextColor } from "../CustomMarks/customMarks";
import { HeadingPlugin } from "../CustomPlugins/HeadingPlugin";
import { ImageExtension } from "../CustomNodes/Image";
import { FAQSection } from "../CustomNodes/FaqSection";

export const starterKitOptions = [
  RootNode,
  MainSection,
  Bold,
  BulletList,
  Code,
  Blockquote,
  CodeblockHighlight,
  Dropcursor,
  Heading.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute("id"),
          renderHTML: (attributes) => {
            return { id: attributes.id };
          },
        },
      };
    },

    addProseMirrorPlugins() {
      const plugins = this.parent?.() || [];

      // Add our custom plugin
      return [...plugins, HeadingPlugin()];
    },
  }),
  History,
  HorizontalRule,
  Italic,
  ListItem,
  OrderedList,
  Paragraph,
  Strike,
  Underline.extend({ exitable: true }),
  TextAlign.configure({
    types: ["paragraph", "heading", "listItem"],
    alignments: ["left", "center", "right", "justify"],
  }),
  Link.extend({ exitable: true, inclusive: false }),
  ImageExtension,
  Text,
  LineBreak,
  TextColor,
  FAQSection,
] as Extensions;
