"use client";

import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Table, type TableColumn } from "premium-ds/table";
import { Pagination } from "premium-ds/pagination";
import { Avatar } from "premium-ds/avatar";
import { Badge } from "premium-ds/badge";
import { LinkIcon } from "@phosphor-icons/react";
import { useAnalyticsStore, JOURNEY_PAGE_SIZE } from "@/stores/analyticsStore";
import { CountryFlag } from "@/lib/countryUtils";
import { getFaviconUrl } from "@/components/ui/favicon";
import type { JourneyVisitor } from "@/lib/analyticsTypes";
import { SystemIcon } from "../../shared/SystemIcon";
import {
  activeReversals,
  reversalAmount,
  revenueParts,
  REVERSAL_LABEL,
} from "../../shared/revenue";
import { JourneyDots } from "./JourneyDots";
import { JourneyDrawer } from "./JourneyDrawer";
import { formatMoney } from "../../shared/chartFormat";
import {
  formatCalendarMoment,
  humanizeDuration,
  isAnonymous,
  sourceDomain,
  sourceLabel,
  visitorLabel,
} from "./journeyFormat";

function VisitorCell({ visitor }: { visitor: JourneyVisitor }) {
  const label = visitorLabel(visitor);

  return (
    <div className="flex items-center gap-3.5">
      <Avatar
        size="lg"
        name={isAnonymous(visitor) ? null : label}
        htmlProps={{ title: visitor.visitorId }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="truncate text-sm font-medium text-foreground">
            {label}
          </span>
          {visitor.revenue.charge > 0 && (
            <Badge tone="success" variant="outline" size="sm">
              Customer
            </Badge>
          )}
        </div>
        <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CountryFlag
              code={visitor.countryCode}
              className="h-2.5 w-3.5 shrink-0"
            />
            {visitor.countryName}
          </span>
          <span className="flex items-center gap-1.5 capitalize">
            <SystemIcon
              kind="device"
              name={visitor.deviceType}
              className="size-3.5"
            />
            {visitor.deviceType}
          </span>
          <span className="flex items-center gap-1.5">
            <SystemIcon kind="os" name={visitor.osName} className="size-3.5" />
            {visitor.osName}
          </span>
          <span className="flex items-center gap-1.5">
            <SystemIcon
              kind="browser"
              name={visitor.browserName}
              className="size-3.5"
            />
            {visitor.browserName}
          </span>
        </div>
      </div>
    </div>
  );
}

function SourceCell({ visitor }: { visitor: JourneyVisitor }) {
  const domain = sourceDomain(visitor);
  const favicon = domain ? getFaviconUrl(domain, 64) : null;

  return (
    <span className="flex items-center gap-2.5 text-sm text-foreground/85">
      {favicon ? (
        <img
          src={favicon}
          alt=""
          className="size-4.5 shrink-0 rounded-sm object-contain"
        />
      ) : (
        <LinkIcon className="size-4.5 shrink-0 text-muted-foreground/60" />
      )}
      {sourceLabel(visitor)}
    </span>
  );
}

function SpentCell({ visitor }: { visitor: JourneyVisitor }) {
  const parts = revenueParts(visitor.revenue);
  const reversals = activeReversals(parts);

  if (parts.total <= 0) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  return (
    <span className="flex flex-col items-start gap-1.5">
      <Badge
        size="md"
        variant="glass"
        pill
        tone={parts.net > 0 ? "success" : "danger"}
      >
        {formatMoney(parts.net)}
      </Badge>
      {reversals.length > 0 && (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {reversals
            .map(
              (kind) =>
                `-${formatMoney(reversalAmount(parts, kind))} ${REVERSAL_LABEL[kind]}`,
            )
            .join(" · ")}
        </span>
      )}
    </span>
  );
}

export function JourneyTab() {
  const {
    journey,
    loading,
    goal,
    search,
    skip,
    setSkip,
    fetchJourney,
    websiteId,
    period,
  } = useAnalyticsStore(
    useShallow((s) => ({
      journey: s.journey,
      loading: s.journeyLoading,
      goal: s.journeyGoal,
      search: s.journeySearch,
      skip: s.journeySkip,
      setSkip: s.setJourneySkip,
      fetchJourney: s.fetchJourney,
      websiteId: s.websiteId,
      period: s.period,
    })),
  );

  const [openVisitorId, setOpenVisitorId] = useState<string | null>(null);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney, websiteId, period, goal, search, skip]);

  const visitors = journey?.visitors ?? [];
  const openVisitor =
    visitors.find((v) => v.visitorId === openVisitorId) ?? null;

  const columns = useMemo<TableColumn<JourneyVisitor>[]>(
    () => [
      {
        key: "visitorId",
        label: "Visitor",
        render: (v) => <VisitorCell visitor={v} />,
      },
      {
        key: "channel",
        label: "Source",
        render: (v) => <SourceCell visitor={v} />,
      },
      {
        key: "revenue",
        label: <span className="pr-10">Spent</span>,
        render: (v) => <SpentCell visitor={v} />,
      },
      {
        key: "timeBeforeGoal",
        label: "Time to complete",
        render: (v) =>
          v.timeBeforeGoal === null ? (
            <span className="text-muted-foreground/50">—</span>
          ) : (
            <span className="text-sm text-foreground/85">
              {humanizeDuration(v.timeBeforeGoal)}
            </span>
          ),
      },
      {
        key: "goalCompletedAt",
        label: goal === "all" ? "Last seen" : "Completed at",
        render: (v) => (
          <span className="flex flex-col gap-1.5">
            <span className="text-sm whitespace-nowrap text-foreground/85">
              {formatCalendarMoment(v.goalCompletedAt ?? v.lastSeenAt)}
            </span>
            <JourneyDots entries={v.completeJourney} />
          </span>
        ),
      },
    ],
    [goal],
  );

  const total = journey?.pagination.totalCount ?? 0;
  const from = visitors.length === 0 ? 0 : skip + 1;
  const to = skip + visitors.length;

  return (
    <div className="flex h-110 flex-col">
      <Table<JourneyVisitor>
        label="Visitor journeys"
        columns={columns}
        rows={visitors}
        rowKey="visitorId"
        loading={loading}
        density="cozy"
        onRowClick={(v) => setOpenVisitorId(v.visitorId)}
        empty={
          search
            ? "No visitors match that search"
            : "No visitors in this period"
        }
        className="min-h-0 flex-1 rounded-none! border-0! shadow-none! [&_td]:px-5 [&_th]:px-5"
        htmlProps={{
          style: { "--tbl-pad-y": "var(--space-4)" } as React.CSSProperties,
        }}
        footer={
          total > JOURNEY_PAGE_SIZE ? (
            <Pagination
              label="Visitors"
              range={[from, to]}
              total={total}
              hasPrev={skip > 0}
              hasNext={journey?.pagination.hasMore ?? false}
              loading={loading}
              onPrev={() => setSkip(Math.max(0, skip - JOURNEY_PAGE_SIZE))}
              onNext={() => setSkip(skip + JOURNEY_PAGE_SIZE)}
            />
          ) : undefined
        }
      />

      <JourneyDrawer
        visitor={openVisitor}
        onClose={() => setOpenVisitorId(null)}
      />
    </div>
  );
}
