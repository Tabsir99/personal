import chalk from "chalk";

/** Per-query stats Tinybird returns for free in every `/v0/sql` response. */
export interface QueryStats {
  elapsed: number; // server compute time, seconds
  rows_read: number; // rows scanned after primary-index pruning
  bytes_read: number;
}

const SLOW_MS = 500;
const LABEL_WIDTH = 16;

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function fmtCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function fmtBytes(n: number): string {
  if (n >= 1 << 20) return `${(n / (1 << 20)).toFixed(1)}MB`;
  if (n >= 1 << 10) return `${(n / (1 << 10)).toFixed(1)}KB`;
  return `${n}B`;
}

const sep = chalk.dim("·");
const tag = chalk.dim("tinybird");

/**
 * One structured line per Tinybird query: wall time, server time, and how much
 * the primary index actually let the engine scan (rows_read / bytes_read — the
 * cheap index-effectiveness signal). Server-side only; chalk self-disables on a
 * non-TTY so production logs stay plain text.
 */
export function logQuery(
  label: string,
  wallMs: number,
  stats: QueryStats | undefined,
  resultRows: number,
): void {
  const slow = wallMs >= SLOW_MS;
  const name = (slow ? chalk.yellow : chalk.cyan)(label.padEnd(LABEL_WIDTH));
  const wall = chalk.bold(fmtMs(wallMs));
  const srv = stats ? fmtMs(stats.elapsed * 1000) : "—";
  const scan = stats
    ? `${fmtCount(stats.rows_read)} rows/${fmtBytes(stats.bytes_read)}`
    : "—";
  const mark = slow ? chalk.yellow("⚠ slow") : chalk.green("✓");

  console.log(
    `${tag} ${name} wall ${wall} ${sep} srv ${srv} ${sep} scan ${chalk.dim(scan)} ${sep} out ${resultRows} ${mark}`,
  );
}

export function logQueryError(
  label: string,
  wallMs: number,
  status: number,
  detail: string,
): void {
  console.error(
    `${tag} ${chalk.red(label.padEnd(LABEL_WIDTH))} wall ${fmtMs(wallMs)} ${sep} ${chalk.red(
      `HTTP ${status}`,
    )} ${sep} ${detail.slice(0, 200)}`,
  );
}

/** Renders an `EXPLAIN indexes = 1` plan (opt-in via TINYBIRD_EXPLAIN=1). */
export function logIndexPlan(label: string, planLines: string[]): void {
  console.log(chalk.dim(`tinybird ${label} · index plan`));
  for (const line of planLines) console.log(chalk.dim(`  ${line}`));
}
