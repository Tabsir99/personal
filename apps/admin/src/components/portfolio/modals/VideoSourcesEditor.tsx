import { useRef } from "react";
import { ArrowDown, ArrowUp, Film, Plus, Upload, X } from "lucide-react";

import { videoSourceType, type VideoSource } from "@tabsircg/schemas/portfolio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Map a file/URL to the <source type> the browser uses to pick a codec.
function typeFromName(name: string): string {
  const ext = name.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "webm") return "video/webm";
  if (ext === "mp4" || ext === "m4v") return "video/mp4";
  if (ext === "ogv" || ext === "ogg") return "video/ogg";
  if (ext === "mov") return "video/quicktime";
  return "";
}

// Edits a video's ordered source list. Upload (multi-file, blob: + auto type)
// or paste a URL; uploaded blobs are swapped for public URLs on save by
// extractAndUploadBlobs. List most-efficient first.
export function VideoSourcesEditor({
  value,
  onChange,
}: {
  value: VideoSource[];
  onChange: (next: VideoSource[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (i: number, patch: Partial<VideoSource>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const playable = value.filter((s) => s.url);

  return (
    <div className="flex flex-col gap-2">
      {playable.length > 0 && (
        // Render every source so the browser previews whichever codec it
        // supports; `key` on the sources forces a reload when URLs change.
        <video
          key={playable.map((s) => s.url).join("|")}
          muted
          playsInline
          controls
          preload="metadata"
          className="aspect-video w-full max-w-[260px] overflow-hidden rounded-md border border-foreground/8 bg-black object-cover"
        >
          {playable.map((s, i) => (
            <source key={i} src={s.url} type={videoSourceType(s) || undefined} />
          ))}
        </video>
      )}

      {value.map((s, i) => (
        <div key={i} className="flex flex-col gap-1">
          {s.filename && (
            <span
              className="truncate font-mono text-[11px] text-muted-foreground"
              title={s.filename}
            >
              {s.filename}
            </span>
          )}
          <div className="grid grid-cols-[1fr_104px_148px_auto] gap-2">
            <Input
              placeholder="https://… or upload"
              value={s.url}
              onChange={(e) => {
                const patch: Partial<VideoSource> = { url: e.target.value };
                if (!s.type) {
                  const t = typeFromName(e.target.value);
                  if (t) patch.type = t;
                }
                update(i, patch);
              }}
              className="font-mono text-xs"
            />
            <Input
              placeholder="video/mp4"
              value={s.type}
              onChange={(e) => update(i, { type: e.target.value })}
              className="font-mono text-xs"
            />
            <Input
              placeholder='codecs e.g. avc1.42E01E'
              value={s.codec}
              onChange={(e) => update(i, { codec: e.target.value })}
              className="font-mono text-xs"
            />
            <div className="flex items-center self-center">
              {value.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Move source up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(i, 1)}
                    disabled={i === value.length - 1}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Move source down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                aria-label="Remove source"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <input
        type="file"
        ref={fileRef}
        accept="video/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) {
            onChange([
              ...value,
              ...files.map((f) => ({
                url: URL.createObjectURL(f),
                type: f.type || typeFromName(f.name),
                codec: "",
                filename: f.name,
              })),
            ]);
          }
          if (fileRef.current) fileRef.current.value = "";
        }}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="flex-1 text-muted-foreground hover:text-foreground"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload video(s)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...value, { url: "", type: "", codec: "", filename: "" }])
          }
          className="flex-1 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add URL
        </Button>
      </div>

      {value.length === 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Film className="h-3.5 w-3.5 shrink-0" />
          Add encoded files (e.g. webm + mp4). The browser downloads only the
          most efficient codec it supports.
        </p>
      )}
    </div>
  );
}
