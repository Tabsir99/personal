import "@tiptap/core"; // Adjust this path if the package structure changes

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textColor: {
      toggleTextColor: (color: string) => ReturnType;
    };
  }
}
