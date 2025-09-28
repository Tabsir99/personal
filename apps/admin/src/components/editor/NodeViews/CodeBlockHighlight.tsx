// CodeBlock.tsx
"use client";

import { Button } from "@/components/ui/button";
import { languages } from "@/lib/constants";
import { Check, ChevronDown, Copy } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type CodeBlockProps = {
  language: string;
  code: string;
  updateAttributes: (attrs: { language: string }) => void;
};

const CodeBlockBase = ({
  children,
  icon,
  name,
  code,
  onLanguageChange,
  languages,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  name: string;
  code: string;
  onLanguageChange?: (value: string) => void;
  languages?: { value: string; name: string; icon: React.ReactNode }[];
}) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [code]);

  return (
    <div className="relative w-full rounded-lg bg-zinc-950/50 border-zinc-800 border-2 font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 select-none">
        <div className="flex items-center gap-2">
          {onLanguageChange && languages && languages.length > 0 ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="flex cursor-pointer rounded-md select-none items-center bg-transparent hover:bg-zinc-800 gap-2 text-zinc-400 hover:text-zinc-100 h-8 px-2">
                  <span className="w-5 h-5">{icon}</span>
                  <span className="text-sm">{name}</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 max-h-64 overflow-auto dark">
                <div className="flex flex-col space-y-1">
                  {languages.map((lang) => (
                    <Button
                      key={lang.value}
                      variant="ghost"
                      size="sm"
                      className="flex items-center justify-start gap-2 h-8"
                      onClick={() => {
                        onLanguageChange(lang.value);
                        setOpen(false);
                      }}
                    >
                      <span className="w-4 h-4">{lang.icon}</span>
                      <span>{lang.name}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <span className="w-5 h-5">{icon}</span>
              <span className="text-sm text-zinc-400">{name}</span>
            </>
          )}
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

export const CodeBlockNodeview = memo(
  ({ language, code, updateAttributes }: CodeBlockProps) => {
    const languageObj = useMemo(
      () => languages.find((lang) => lang.value === language) || languages[0],
      [language]
    );

    const handleLanguageChange = useCallback(
      (value: string) => {
        updateAttributes({ language: value });
      },
      [updateAttributes]
    );

    return (
      <NodeViewWrapper>
        <CodeBlockBase
          code={code}
          icon={languageObj.icon}
          name={languageObj.name}
          onLanguageChange={handleLanguageChange}
          languages={languages}
        >
          <NodeViewContent as="code" />
        </CodeBlockBase>
      </NodeViewWrapper>
    );
  }
);

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
        <code
          dangerouslySetInnerHTML={{ __html: codeHtml }}
          className="whitespace-pre"
        />
      </pre>
    </div>
  );
};
