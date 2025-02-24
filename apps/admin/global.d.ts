import "@tiptap/core"; // Adjust this path if the package structure changes
import { useEditor } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customCommands: {
      toggleTextColor: (color: string) => ReturnType;
      toggleBlockquote: () => ReturnType;
    };
    // textColor: {
    //   toggleTextColor: (color: string) => ReturnType;
    // };
    // customBlockquotes: {
    //   toggleBlockquote: () => ReturnType;
    // };
  }
}

// import { useEditor } from "@tiptap/react";
// useEditor()?.commands.customCommands.

export {};
