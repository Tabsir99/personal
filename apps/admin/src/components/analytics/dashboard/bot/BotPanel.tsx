"use client";

import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Robot } from "@phosphor-icons/react";
import { useAnalyticsStore } from "../../../../stores/analyticsStore";
import { BotChart } from "./BotChart";
import { BotSheet } from "./BotSheet";
import { resolveBot, botTint, categoryMeta } from "./botRegistry";
import { useImageAccent } from "../shared/useImageAccent";
import { getFaviconUrl } from "@/components/ui/favicon";
import type { BotCategory, BotMetric } from "@/lib/analyticsTypes";
import {
  FloatingTooltipPortal,
  type TooltipSection,
} from "../shared/AnalyticsTooltip";

export function BotPanel() {
  const { bots, loading, granularity } = useAnalyticsStore(
    useShallow((s) => ({
      bots: s.bots,
      loading: s.botsLoading,
      granularity: s.granularity,
    })),
  );
  const [selected, setSelected] = useState<BotMetric | null>(null);
  const [picked, setPicked] = useState<BotCategory | null>(null);
  const [hoveredBot, setHoveredBot] = useState<BotMetric | null>(null);

  const handleLeave = useCallback(() => {
    setHoveredBot(null);
  }, []);

  const buildBotTooltip = (bot: BotMetric): TooltipSection[] => {
    const meta = resolveBot(bot.name);
    const catMeta = categoryMeta(bot.category);
    const faviconUrl = meta.domain ? getFaviconUrl(meta.domain, 64) : null;
    return [
      <div
        key="hdr"
        className="flex items-center gap-2 px-3.5 pt-3 pb-2 text-sm font-semibold text-background"
      >
        {faviconUrl ? (
          <img src={faviconUrl} alt="" className="size-4 object-contain" />
        ) : (
          <Robot className="size-4" weight="fill" />
        )}
        <span>{meta.label}</span>
      </div>,
      {
        label: "Crawl hits",
        value: bot.count.toLocaleString(),
        color: "series",
      },
      {
        label: "Category",
        value: catMeta.label,
        dim: true,
      },
      "Click row to view top requested pages",
    ];
  };

  if (loading) {
    return <div className="h-105 animate-pulse rounded-lg bg-foreground/3" />;
  }

  const categories = bots?.categories ?? [];
  const active =
    picked ??
    (categories.length
      ? categories.reduce((a, b) => (b.count > a.count ? b : a)).category
      : null);

  const list = (bots?.bots ?? []).filter(
    (b) => !active || b.category === active,
  );

  return (
    <div className="relative h-105 overflow-hidden rounded-lg border border-foreground/6 bg-card">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="min-w-0 flex-1 border-b border-foreground/6 lg:border-r lg:border-b-0">
          <BotChart
            data={bots?.timeseries ?? []}
            categories={categories}
            activeCategory={active}
            onCategoryChange={setPicked}
            granularity={granularity}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:w-80 lg:flex-none">
          <div className="flex shrink-0 items-center border-b border-foreground/6 px-4 py-3">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Crawlers
            </span>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto p-2"
            onMouseLeave={handleLeave}
          >
            {list.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground/50">
                No bot activity
              </div>
            ) : (
              list.map((bot) => (
                <BotRow
                  key={bot.name}
                  bot={bot}
                  isHovered={hoveredBot?.name === bot.name}
                  onMouseEnter={() => setHoveredBot(bot)}
                  onClick={() => setSelected(bot)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingTooltipPortal
        sections={hoveredBot ? buildBotTooltip(hoveredBot) : null}
      />

      <BotSheet bot={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function BotRow({
  bot,
  isHovered,
  onMouseEnter,
  onClick,
}: {
  bot: BotMetric;
  isHovered: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const meta = resolveBot(bot.name);
  const faviconUrl = meta.domain ? getFaviconUrl(meta.domain, 64) : null;
  const accent = useImageAccent(faviconUrl) ?? meta.color;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{ background: isHovered ? botTint(accent, 0.1) : undefined }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors"
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md"
        style={{ background: botTint(accent, 0.14) }}
      >
        {faviconUrl ? (
          <img src={faviconUrl} alt="" className="size-5 object-contain" />
        ) : (
          <Robot
            className="size-4"
            weight="fill"
            style={{ color: accent ?? "var(--color-primary)" }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
        {meta.label}
      </span>
      <span className="font-mono text-sm font-medium text-foreground/70 tabular-nums">
        {bot.count.toLocaleString()}
      </span>
    </button>
  );
}
