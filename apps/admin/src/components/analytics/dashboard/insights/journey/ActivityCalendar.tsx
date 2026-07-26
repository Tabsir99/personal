import { useMemo } from "react";
import type { JourneyEntry, JourneyEventType } from "@/lib/analyticsTypes";
import { DOT_TINT } from "./journeyEntryStyle";

const CALENDAR_MONTHS = 7;
const DAYS_PER_WEEK = 7;

const TYPE_RANK: Record<JourneyEventType, number> = {
  referral: 0,
  pageview: 1,
  custom: 2,
  payment: 3,
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

interface CalendarCell {
  key: string;
  date: Date;
  type: JourneyEventType | null;
}

function buildWeeks(
  entries: JourneyEntry[],
  now = Date.now(),
): CalendarCell[][] {
  const dominant = new Map<string, JourneyEventType>();
  for (const entry of entries) {
    const key = dayKey(new Date(entry.timestamp));
    const current = dominant.get(key);
    if (!current || TYPE_RANK[entry.eventType] > TYPE_RANK[current]) {
      dominant.set(key, entry.eventType);
    }
  }

  const today = new Date(now);
  const firstMonth = new Date(
    today.getFullYear(),
    today.getMonth() - (CALENDAR_MONTHS - 1),
    1,
  );

  const weeks: CalendarCell[][] = [];
  const cursor = startOfWeek(firstMonth);

  while (cursor <= today) {
    const week: CalendarCell[] = [];
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      const date = new Date(cursor);
      const key = dayKey(date);
      week.push({ key, date, type: dominant.get(key) ?? null });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

export function ActivityCalendar({ entries }: { entries: JourneyEntry[] }) {
  const weeks = useMemo(() => buildWeeks(entries), [entries]);

  const monthLabels = weeks.map((week, index) => {
    const endOfWeek = week[DAYS_PER_WEEK - 1].date;
    const previous =
      index === 0 ? null : weeks[index - 1][DAYS_PER_WEEK - 1].date.getMonth();
    return endOfWeek.getMonth() === previous
      ? null
      : endOfWeek.toLocaleDateString("en-US", { month: "short" });
  });

  return (
    <div className="min-w-0">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
        role="img"
        aria-label={`Activity over the last ${CALENDAR_MONTHS} months`}
      >
        {weeks.map((week) => (
          <div key={week[0].key} className="grid grid-rows-7 gap-0.5">
            {week.map((cell) => (
              <span
                key={cell.key}
                title={cell.date.toDateString()}
                className="aspect-square rounded-full"
                style={
                  cell.type
                    ? { background: DOT_TINT[cell.type] }
                    : { boxShadow: "inset 0 0 0 1px var(--color-border)" }
                }
              />
            ))}
          </div>
        ))}
      </div>

      <div className="relative mt-2 h-4 text-xs text-muted-foreground/70">
        {monthLabels.map((label, index) =>
          label ? (
            <span
              key={weeks[index][0].key}
              className="absolute top-0 whitespace-nowrap"
              style={{ left: `${(index / weeks.length) * 100}%` }}
            >
              {label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}
