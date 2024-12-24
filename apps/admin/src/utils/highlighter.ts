// import hljs from "highlight.tsx"
import hljs from 'highlight.js/lib/core'
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import rust from 'highlight.js/lib/languages/rust'
import typescript from 'highlight.js/lib/languages/typescript';
import java from 'highlight.js/lib/languages/java';

hljs.registerLanguage('javascript',javascript)
hljs.registerLanguage('python',python)
hljs.registerLanguage('rust',rust)
hljs.registerLanguage('typescript',typescript)
hljs.registerLanguage('java',java)


export const highlightAll = hljs.highlightAll
