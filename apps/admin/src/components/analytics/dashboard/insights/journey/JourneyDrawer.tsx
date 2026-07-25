"use client";

import { useState } from "react";
import { Sheet } from "premium-ds/sheet";
import { Avatar } from "premium-ds/avatar";
import { Badge } from "premium-ds/badge";
import { EyeIcon, SparkleIcon } from "@phosphor-icons/react";
import { CountryFlag } from "@/lib/countryUtils";
import type { JourneyVisitor } from "@/lib/analyticsTypes";
import { SystemIcon } from "../../shared/SystemIcon";
import { ActivityCalendar } from "./ActivityCalendar";
import { JourneyTimeline } from "./JourneyTimeline";
import {
  formatMoney,
  humanizeDuration,
  isAnonymous,
  visitorLabel,
} from "./journeyFormat";

function ProfileFact({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-foreground/85">
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function ProfilePanel({ visitor }: { visitor: JourneyVisitor }) {
  const label = visitorLabel(visitor);
  const metadata = Object.entries(visitor.profileMetadata).filter(
    ([, value]) => value !== "" && value != null,
  );

  return (
    <div className="flex min-h-0 w-96 shrink-0 flex-col overflow-y-auto px-14 py-8">
      <Avatar
        size="xl"
        name={isAnonymous(visitor) ? null : label}
        className="mb-5"
      />

      <div className="flex items-center gap-2">
        <span className="truncate text-base font-semibold text-foreground">
          {label}
        </span>
        {visitor.amount > 0 && (
          <Badge tone="danger" variant="glass" size="sm">
            Customer
          </Badge>
        )}
      </div>

      {visitor.customerEmail && (
        <div className="mt-1.5 truncate text-sm text-muted-foreground">
          {visitor.customerEmail}
        </div>
      )}

      <div className="mt-7 space-y-3.5">
        <ProfileFact
          icon={
            <CountryFlag
              code={visitor.countryCode}
              className="h-2.5 w-3.5 shrink-0"
            />
          }
        >
          {visitor.cityName
            ? `${visitor.countryName}, ${visitor.cityName}`
            : visitor.countryName}
        </ProfileFact>
        <ProfileFact
          icon={
            <SystemIcon
              kind="device"
              name={visitor.deviceType}
              className="size-3.5 shrink-0"
            />
          }
        >
          <span className="capitalize">{visitor.deviceType}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">
            {visitor.viewport.width}×{visitor.viewport.height}
          </span>
        </ProfileFact>
        <ProfileFact
          icon={
            <SystemIcon
              kind="os"
              name={visitor.osName}
              className="size-3.5 shrink-0"
            />
          }
        >
          {visitor.osName}
        </ProfileFact>
        <ProfileFact
          icon={
            <SystemIcon
              kind="browser"
              name={visitor.browserName}
              className="size-3.5 shrink-0"
            />
          }
        >
          {visitor.browserName}
        </ProfileFact>
      </div>

      {metadata.length > 0 && (
        <div className="mt-8 border-t border-foreground/6 pt-4">
          <div className="mb-2.5 text-xs tracking-wide text-muted-foreground/60 uppercase">
            Payment parameters
          </div>
          {metadata.map(([key, value]) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-3 py-1.5"
            >
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {key}
              </span>
              <span
                title={String(value)}
                className="min-w-0 truncate font-mono text-xs text-foreground/90"
              >
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsPanel({ visitor }: { visitor: JourneyVisitor }) {
  return (
    <div className="flex min-h-0 w-96 shrink-0 flex-col overflow-y-auto px-14 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xl font-semibold text-foreground tabular-nums">
            <EyeIcon className="size-4 text-muted-foreground/70" />
            {visitor.pageviews}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">pageviews</div>
        </div>
        <div>
          <div className="text-xl font-semibold text-foreground tabular-nums">
            {formatMoney(visitor.amount)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">spent</div>
        </div>
        <div>
          <div className="text-xl font-semibold whitespace-nowrap text-foreground">
            {visitor.timeBeforeGoal === null
              ? "—"
              : humanizeDuration(visitor.timeBeforeGoal)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            to completion
          </div>
        </div>
      </div>

      <div className="mt-9">
        <div className="mb-3.5 text-xs tracking-wide text-muted-foreground/60 uppercase">
          Activity
        </div>
        <ActivityCalendar entries={visitor.completeJourney} />
      </div>

      <div className="mt-9">
        <div className="mb-2.5 flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground/60 uppercase">
          <SparkleIcon className="size-3" />
          Summary
        </div>
        <p className="text-sm text-muted-foreground/50 italic">coming soon…</p>
      </div>
    </div>
  );
}

export function JourneyDrawer({
  visitor,
  onClose,
}: {
  visitor: JourneyVisitor | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState<JourneyVisitor | null>(visitor);
  if (visitor && visitor !== shown) setShown(visitor);

  return (
    <Sheet
      side="bottom"
      open={visitor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      htmlProps={{ className: "h-[78vh]" }}
    >
      {shown ? (
        <div
          role="dialog"
          aria-label={`Journey for ${visitorLabel(shown)}`}
          className="flex h-full min-h-0 flex-col overflow-hidden rounded-t-2xl border-t border-foreground/8 bg-card shadow-dialog"
        >
          <div className="flex shrink-0 justify-center pt-2.5 pb-1">
            <span
              className="h-1 w-9 rounded-full bg-foreground/15"
              aria-hidden
            />
          </div>
          <div className="flex min-h-0 flex-1">
            <ProfilePanel visitor={shown} />
            <div className="flex min-w-0 flex-1 flex-col py-6">
              {shown.truncated && (
                <p className="mb-2 px-3 text-xs text-muted-foreground/70">
                  Showing the most recent events — this history is truncated.
                </p>
              )}
              <JourneyTimeline entries={shown.completeJourney} />
            </div>
            <StatsPanel visitor={shown} />
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
