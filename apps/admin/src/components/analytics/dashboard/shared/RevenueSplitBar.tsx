import { CHART, REVERSAL } from "./chartTheme";
import { REVERSAL_KINDS, reversalAmount, type RevenueParts } from "./revenue";
import { cn } from "@/lib/utils";

export function RevenueSplitBar({
  parts,
  className,
  keptColor = CHART.revenue,
}: {
  parts: RevenueParts;
  className?: string;
  keptColor?: string;
}) {
  if (parts.total <= 0) return null;

  const share = (value: number) => `${(value / parts.total) * 100}%`;

  return (
    <span
      aria-hidden
      className={cn("flex h-1.5 w-full gap-0.5 overflow-hidden", className)}
    >
      {parts.kept > 0 && (
        <span
          className="h-full rounded-l-sm last:rounded-r-sm"
          style={{ width: share(parts.kept), background: keptColor }}
        />
      )}
      {REVERSAL_KINDS.map((kind) => {
        const amount = reversalAmount(parts, kind);
        if (amount <= 0) return null;
        const { fill, stroke, borderStyle } = REVERSAL[kind];
        return (
          <span
            key={kind}
            className="h-full first:rounded-l-sm last:rounded-r-sm"
            style={{
              width: share(amount),
              background: fill,
              border: `1px ${borderStyle} ${stroke}`,
            }}
          />
        );
      })}
    </span>
  );
}
