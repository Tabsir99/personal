"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/react/shallow";
import { TextField } from "premium-ds/text-field";
import { MagnifyingGlass, Robot, X } from "@phosphor-icons/react";
import { useAnalyticsStore } from "./analyticsStore";
import { resolveBot, categoryMeta, botTint } from "./botRegistry";
import { getFaviconUrl } from "@/components/ui/favicon";
import type { BotMetric, BotPagesResponse } from "@/lib/analyticsTypes";

const PERIOD_LABEL: Record<string, string> = {
  today: "Today",
  yesterday: "Yesterday",
  last7d: "Last 7 days",
  last30d: "Last 30 days",
  last90d: "Last 90 days",
};

// In-card slide-over: absolutely positioned inside BotPanel's relative box and
// clipped by its overflow-hidden, so it fits the panel rather than the page.
export function BotSheet({
  bot,
  onClose,
}: {
  bot: BotMetric | null;
  onClose: () => void;
}) {
  // Keep the last bot while closing so the exit animation keeps its content.
  const [shown, setShown] = useState<BotMetric | null>(bot);
  if (bot && bot !== shown) setShown(bot);

  return (
    <AnimatePresence>
      {bot && shown
        ? [
            <motion.div
              key="scrim"
              className="absolute inset-0 z-10 bg-foreground/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden
            />,
            <motion.div
              key="panel"
              className="absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col border-l border-border bg-card shadow-card-hover"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <BotSheetBody key={shown.name} bot={shown} onClose={onClose} />
            </motion.div>,
          ]
        : null}
    </AnimatePresence>
  );
}

// Keyed by bot name, so each open mounts fresh — no state resets in an effect.
function BotSheetBody({
  bot,
  onClose,
}: {
  bot: BotMetric;
  onClose: () => void;
}) {
  const { fetchBotPages, period } = useAnalyticsStore(
    useShallow((s) => ({ fetchBotPages: s.fetchBotPages, period: s.period })),
  );
  const [data, setData] = useState<BotPagesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchBotPages(bot.name).then((res) => {
      if (cancelled) return;
      setData(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bot.name, fetchBotPages]);

  const meta = resolveBot(bot.name);
  const faviconUrl = meta.domain ? getFaviconUrl(meta.domain, 64) : null;
  const cat = categoryMeta(bot.category);

  const pages = (data?.pages ?? []).filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
          style={{ background: botTint(meta.color, 0.14) }}
        >
          {faviconUrl ? (
            <img src={faviconUrl} alt="" className="size-5 object-contain" />
          ) : (
            <Robot
              className="size-5"
              weight="fill"
              style={{ color: meta.color ?? "var(--color-primary)" }}
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {meta.label}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-mono tabular-nums">
              {(data?.total ?? bot.count).toLocaleString()}
            </span>
            <span>crawls</span>
            <span aria-hidden>·</span>
            <span>{PERIOD_LABEL[period] ?? period}</span>
            <span aria-hidden>·</span>
            <span>{cat.label}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/6 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <TextField
          size="sm"
          placeholder="Filter pages"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          leadingIcon={<MagnifyingGlass className="size-3.5" />}
          clearable
          aria-label="Filter pages"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-7 animate-pulse rounded-md bg-foreground/4"
              />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground/50">
            No pages
          </div>
        ) : (
          pages.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 rounded-md px-3 py-1.5 hover:bg-foreground/3"
            >
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground/80">
                {p.name}
              </span>
              <span className="shrink-0 font-mono text-xs font-medium text-foreground/60 tabular-nums">
                {p.count.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
