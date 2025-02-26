// CodeBlock.tsx
"use client";

import { Button } from "@/components/ui/button";
import { languages } from "@/utils/constants";
import { Check, Copy } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlockBase = ({
  children,
  icon,
  name,
  code,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  name: string;
  code: string;
}) => {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, []);

  return (
    <div className="relative w-full rounded-lg bg-zinc-950/50 border-zinc-800 border-2 font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 select-none">
        <div className="flex items-center gap-2">
          <span className=" w-5 h-5">{icon}</span>
          <span className="text-sm text-zinc-400">{name}</span>
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
      <pre className="p-4 overflow-auto max-h-48 max-sm:max-h-56 text-sm">
        {children}
      </pre>
    </div>
  );
};

export const CodeBlockNodeview = memo(({ language, code }: CodeBlockProps) => {
  const languageObj = useMemo(
    () => languages.find((lang) => lang.value === language),
    [language]
  )!;

  return (
    <NodeViewWrapper>
      <CodeBlockBase
        code={code}
        icon={languageObj?.icon}
        name={languageObj?.name}
      >
        <NodeViewContent as="code" />
      </CodeBlockBase>
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
  const { icon, name } = languages.find((lang) => lang.value === language)!;

  return (
    <CodeBlockBase code={code} icon={icon} name={name}>
      <code
        dangerouslySetInnerHTML={{ __html: codeHtml }}
        className="whitespace-pre"
      />
    </CodeBlockBase>
  );
};
