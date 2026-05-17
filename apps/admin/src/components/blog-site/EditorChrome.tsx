"use client";

import { Kbd } from "@/components/ui/Kbd";

export default function EditorChrome() {
  return (
    <header className="border-b border-foreground/6 pb-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        What lives on <span className="italic">/blog</span>
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Hero copy, the “now reading” sticker, and what you’re currently
        building. The portfolio fetches this each render — press{" "}
        <Kbd size="sm">⌘S</Kbd> to save and the public site picks it up on the
        next visit.
      </p>
    </header>
  );
}
