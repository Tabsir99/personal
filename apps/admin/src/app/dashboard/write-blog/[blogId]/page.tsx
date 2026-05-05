"use client";
import dynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/write-post/EditorSkeleton";

const TextEditor = dynamic(() => import("@/components/write-post/AppEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-svh flex flex-col">
      <div className="flex sticky top-0 z-10 h-14 -translate-y-6 items-center justify-end px-6 py-2 border-b border-border/50">
        <div className="h-3 w-16 rounded-full bg-muted animate-pulse" />
      </div>
      <EditorSkeleton />
    </div>
  ),
});

export default function Page() {
  return <TextEditor />;
}
