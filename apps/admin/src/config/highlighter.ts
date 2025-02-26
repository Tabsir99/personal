import { getSingletonHighlighterCore } from "shiki/dist/core.mjs";
import { createJavaScriptRegexEngine } from "shiki/dist/engine-javascript.mjs";
import DarkPlus from "shiki/dist/themes/dark-plus.mjs";
import LangJavaScript from "shiki/dist/langs/javascript.mjs";
import LangTypeScript from "shiki/dist/langs/typescript.mjs";
import LangPython from "shiki/dist/langs/python.mjs";
import LangBash from "shiki/dist/langs/bash.mjs";
import LangRust from "shiki/dist/langs/rust.mjs";
import LangGo from "shiki/dist/langs/go.mjs";

export type RealtimeHighlightResult = { text: string; style: string };

const highlighterCore = await getSingletonHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [
    LangJavaScript,
    LangTypeScript,
    LangPython,
    LangBash,
    LangRust,
    LangGo,
  ],
  themes: [DarkPlus],
});

export const highlightCodeblock = (
  code: string,
  lang: string,
  realTime: boolean
) => {
  const { tokens } = highlighterCore.codeToTokens(code, {
    lang: lang as any,
    theme: "dark-plus",
  });

  let result: RealtimeHighlightResult[] | string = realTime ? [] : "";

  for (const line of tokens) {
    for (const token of line) {
      if (Array.isArray(result)) {
        if (!token.content.trim()) {
          result[result.length - 1].text += token.content;
          continue;
        }
        result.push({
          text: token.content,
          style: `color: ${token.color}`,
        });
        continue;
      }

      if (token.content.trim() === "") {
        // Just output the whitespace directly
        result += token.content;
      } else {
        // Style actual code tokens
        const style = `color: ${token.color}`;
        result += `<span style="${style}">${token.content}</span>`;
      }
    }
    // Add line breaks between lines if needed
    if (tokens.indexOf(line) < tokens.length - 1) {
      if (Array.isArray(result)) {
        result.push({ style: "", text: "\n" });
        continue;
      }
      result += "\n";
    }
  }

  return result;
};
