import { cn } from "@/lib/utils";

export const EditorSkeleton = () => (
  <div className="w-full min-h-svh flex flex-col">
    <div className="sticky h-14 top-0 z-10 flex items-center justify-between px-6 border-b border-border/50 bg-background/80">
      <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
    <div className="flex-1 flex justify-center py-5 px-4">
      <div className="w-full max-w-3xl px-16 py-14 flex flex-col gap-4 border border-border/70 rounded-md">
        <div
          className="h-8 w-2/3 rounded-full bg-muted animate-pulse mb-6"
          style={{ animationDuration: "1.4s" }}
        />
        {[100, 85, 92, 100, 60, 78, 88, 100, 72, 45].map((width, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-muted animate-pulse",
              i % 4 === 3 ? "h-3 mb-2" : "h-3",
            )}
            style={{
              width: `${width}%`,
              animationDelay: `${i * 60}ms`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>
    </div>
  </div>
);
