// CodeBlock.tsx
"use client";

import { Button } from "@/components/ui/button";
import { languages } from "@/utils/constants";
import { Check, Copy, Terminal } from "lucide-react";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

interface CodeBlockProps {
  language: string;
}

export const CodeBlockNodeview = memo(({ language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement | null>(null);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(preRef.current?.innerText!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, []);

  console.log(language);
  const languageObj = useMemo(
    () => languages.find((lang) => lang.value === language),
    [language]
  );

  return (
    <NodeViewWrapper>
      <div className="relative w-full rounded-lg bg-zinc-950/50 border-zinc-800 border-2 font-mono">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 select-none">
          <div className="flex items-center gap-2">
            <span className=" w-5 h-5">{languageObj?.icon}</span>
            <span className="text-sm text-zinc-400">{languageObj?.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
            onClick={onCopy}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <pre
          ref={preRef}
          className="p-4 overflow-auto max-h-48 max-sm:max-h-56 text-sm"
        >
          <NodeViewContent as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
});

export const PreviewCodeBlock = ({
  code,
  codeHtml,
  language,
}: {
  code: string;
  codeHtml: string;
  language: string;
}) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const languageObj = languages.find((lang) => lang.value === language);
  const languageIcon = languageObj?.icon || <Terminal className="h-4 w-4" />;
  const languageName = languageObj?.name || language;

  return (
    <div className="relative w-full rounded-lg bg-zinc-950/50 border-zinc-800 border-2 font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 select-none">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5">{languageIcon}</span>
          <span className="text-sm text-zinc-400">{languageName}</span>
        </div>
        <button
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-auto max-h-48 max-sm:max-h-56 text-sm">
        <code
          dangerouslySetInnerHTML={{ __html: codeHtml }}
          className="whitespace-pre"
        />
      </pre>
    </div>
  );
};
