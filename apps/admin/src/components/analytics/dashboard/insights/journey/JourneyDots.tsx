import type { JourneyEntry } from "@/lib/analyticsTypes";
import { DOT_TINT } from "./journeyEntryStyle";

const VISIBLE_DOTS = 7;

export function JourneyDots({ entries }: { entries: JourneyEntry[] }) {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {entries.slice(-VISIBLE_DOTS).map((entry, i) => (
        <span
          key={`${entry.timestamp}-${i}`}
          className="size-1.5 rounded-full"
          style={{ background: DOT_TINT[entry.eventType] }}
        />
      ))}
    </span>
  );
}
