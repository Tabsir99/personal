// import hljs from "highlight.tsx"
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import java from "highlight.js/lib/languages/java";
import bash from "highlight.js/lib/languages/bash";

hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("java", java);
hljs.registerLanguage("bash", bash);

export const preHighlight = (html: string) => {
  return html.replace(
    /<code class="language-(.*?)">([\s\S]*?)<\/code>/g,
    (_, lang, code) => {
      const decodedCode = code
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const highlightedCode = hljs.highlight(decodedCode, {
        language: lang,
        ignoreIllegals: true,
      }).value;

      return `<code>${highlightedCode}</code>`;
    }
  );
};

export const highlightAll = hljs.highlightAll;
