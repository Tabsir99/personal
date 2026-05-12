import * as React from "react";

export default function Eyebrow({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent";
}) {
  return (
    <span
      className={[
        "font-mono text-[10px] uppercase",
        tone === "accent" ? "text-primary" : "text-muted-foreground",
      ].join(" ")}
      style={{ letterSpacing: "0.16em" }}
    >
      {children}
    </span>
  );
}
