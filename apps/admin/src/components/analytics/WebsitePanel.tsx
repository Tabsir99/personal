"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  PencilSimple,
  Trash,
  Copy,
  Check,
  Code,
  Fingerprint,
  Link as LinkIcon,
  Package,
} from "@phosphor-icons/react";
import { Button } from "premium-ds/button";
import { Badge } from "premium-ds/badge";
import { Tag, TagGroup } from "premium-ds/tag";
import { Tabs, TabPanel } from "premium-ds/tabs";
import { toast } from "premium-ds/toast";
import { Dialog } from "premium-ds/dialog";
import type { AnalyticsWebsite } from "@/actions/analyticsActions";
import { deleteAnalyticsWebsite } from "@/actions/analyticsActions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MiniChart, generateEmptyTimeseries } from "./MiniChart";
import type { TimeseriesPoint } from "./dashboard/types";

interface WebsitePanelProps {
  site: AnalyticsWebsite;
  onEdit: () => void;
  onMutate: () => void;
}

export function WebsitePanel({ site, onEdit, onMutate }: WebsitePanelProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [snippetTab, setSnippetTab] = useState("script");
  const [snippetDir, setSnippetDir] = useState<-1 | 0 | 1>(0);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);

  const fetchChart = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/analytics/main?websiteId=${site.id}&period=30d&granularity=daily`,
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json.status === "success") {
        setTimeseries(json.data.timeseries ?? []);
      }
    } catch {
      // chart is supplementary
    } finally {
      setChartLoading(false);
    }
  }, [site.id]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteAnalyticsWebsite(site.id);
    setDeleting(false);
    if (res.status === "error") {
      toast.error(res.message);
      return;
    }
    toast.success(`"${site.name}" deleted`);
    setOpenDelete(false);
    onMutate();
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(site.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const scriptSnippet = `<script defer src="https://analytics.tabsircg.com/script.js" data-website-id="${site.id}"></script>`;
  const sdkSnippet = `import { init } from '@tabsircg/analytics/sdk'

init({ websiteId: '${site.id}' })`;

  const activeSnippet = snippetTab === "script" ? scriptSnippet : sdkSnippet;

  const copySnippet = async () => {
    await navigator.clipboard.writeText(activeSnippet);
    setSnippetCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const faviconUrl = getFaviconUrl(site.origins);

  return (
    <div className="group/panel rounded-lg border border-foreground/6 bg-card text-card-foreground shadow-card-rest">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-foreground/6">
        <div className="flex items-center gap-3 min-w-0">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="size-7 shrink-0 rounded-md object-contain bg-foreground/[0.03]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary ${faviconUrl ? "hidden" : ""}`}
          >
            <Globe size={15} weight="duotone" />
          </div>
          <Link
            href={`/analytics/${site.id}`}
            className="truncate text-[15px] font-semibold tracking-tight text-foreground underline decoration-foreground/20 underline-offset-2 hover:decoration-foreground/60 transition-colors"
          >
            {site.name}
          </Link>
          {site.createdAt && (
            <span className="hidden sm:inline text-[11px] text-muted-foreground/60 font-mono tabular-nums">
              since{" "}
              {new Date(site.createdAt).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover/panel:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Edit"
          >
            <PencilSimple size={15} />
          </Button>
          <Dialog
            open={openDelete}
            onOpenChange={setOpenDelete}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                loading={deleting}
                aria-label="Delete"
                className="hover:text-destructive!"
              >
                <Trash size={15} />
              </Button>
            }
            tone="danger"
            title="Delete website?"
            description="All analytics data for this website will be permanently deleted."
            footer={(close) => (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Delete
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Chart + Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] divide-y lg:divide-y-0 lg:divide-x divide-foreground/6">
        {/* Chart */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Eyebrow tone="muted" size="xs">
              Visitors · 30 days
            </Eyebrow>
            {!chartLoading && timeseries.length > 0 && (
              <Badge tone="success" size="sm" dot>
                Active
              </Badge>
            )}
          </div>
          <div className="h-[140px]">
            {chartLoading ? (
              <div className="h-full w-full animate-pulse rounded-md bg-foreground/[0.03]" />
            ) : (
              <MiniChart
                data={
                  timeseries.length > 0 ? timeseries : generateEmptyTimeseries()
                }
                empty={timeseries.length === 0}
              />
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col divide-y divide-foreground/6">
          <InfoCell icon={<Fingerprint size={13} />} label="Website ID">
            <button
              type="button"
              onClick={copyId}
              className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-foreground/80 transition-colors hover:text-foreground"
            >
              {site.id}
              {copied ? (
                <Check size={10} weight="bold" className="text-success" />
              ) : (
                <Copy size={10} className="text-muted-foreground/60" />
              )}
            </button>
          </InfoCell>
          <InfoCell icon={<LinkIcon size={13} />} label="Origins">
            <TagGroup label={`Origins for ${site.name}`}>
              {site.origins.map((origin) => (
                <Tag key={origin} size="sm">
                  {origin}
                </Tag>
              ))}
            </TagGroup>
          </InfoCell>
        </div>
      </div>

      {/* Tracking snippet */}
      <div className="border-t border-foreground/6 px-6 py-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <Tabs
            label="Snippet format"
            items={[
              {
                value: "script",
                label: "Script tag",
                icon: <Code size={13} />,
              },
              { value: "sdk", label: "NPM SDK", icon: <Package size={13} /> },
            ]}
            value={snippetTab}
            onChange={(v, d) => {
              setSnippetTab(v);
              setSnippetDir(d);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={copySnippet}
            iconLeft={
              snippetCopied ? (
                <Check size={12} weight="bold" className="text-success" />
              ) : (
                <Copy size={12} />
              )
            }
          >
            {snippetCopied ? "Copied" : "Copy"}
          </Button>
        </div>
        <TabPanel tab={snippetTab} dir={snippetDir}>
          <pre className="font-mono text-xs rounded-md leading-relaxed text-foreground/75 select-all whitespace-pre px-4 py-3 bg-foreground/5">
            {activeSnippet}
          </pre>
        </TabPanel>
      </div>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-muted-foreground/50">{icon}</span>
        <Eyebrow tone="muted" size="xs">
          {label}
        </Eyebrow>
      </div>
      <div>{children}</div>
    </div>
  );
}

function getFaviconUrl(origins: string[]): string | null {
  const real = origins.find((o) => o !== "*" && o.startsWith("http"));
  if (!real) return null;
  try {
    const hostname = new URL(real).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}
