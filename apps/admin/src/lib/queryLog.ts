import chalk, { type ChalkInstance } from "chalk";

/** Per-query stats Tinybird returns for free in every `/v0/sql` response. */
export interface QueryStats {
  elapsed: number; // server compute time, seconds
  rows_read: number; // rows scanned after primary-index pruning
  bytes_read: number;
}

interface QueryResult {
  statistics?: QueryStats;
  rows: number;
}

const SLOW_MS = 500;
const LABEL_COL = 8; // field-name column width, so values line up

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

// A blank line above each block sets it apart from the framework's request
// logs; the label is tinted and the fields are indented under it.
function header(label: string, tint: ChalkInstance, badge: string): string {
  return `\n${chalk.dim("tinybird")} ${tint.bold(label)}  ${badge}`;
}

function field(name: string, value: string): string {
  return `  ${chalk.dim(name.padEnd(LABEL_COL))}${value}`;
}

/**
 * One structured, multi-line block per Tinybird query: wall + server time and
 * how much the primary index let the engine scan (rows_read / bytes_read — the
 * cheap index-effectiveness signal), plus where the full SQL was dumped for
 * copy/paste. Server-side only; chalk self-disables on a non-TTY so production
 * logs stay plain text.
 */
export function logQuery(
  label: string,
  wallMs: number,
  result: QueryResult,
  sqlFile?: string,
): void {
  const { statistics: stats, rows } = result;
  const slow = wallMs >= SLOW_MS;
  const lines = [
    header(
      label,
      slow ? chalk.yellow : chalk.cyan,
      slow ? chalk.yellow("⚠ slow") : chalk.green("✓"),
    ),
    field("wall", chalk.bold(fmtMs(wallMs))),
  ];
  if (stats) {
    lines.push(field("server", fmtMs(stats.elapsed * 1000)));
    lines.push(
      field(
        "scan",
        `${fmtCount(stats.rows_read)} rows ${chalk.dim("·")} ${fmtBytes(stats.bytes_read)}`,
      ),
    );
  }
  lines.push(field("output", `${rows} rows`));
  if (sqlFile) lines.push(field("sql", chalk.dim(sqlFile)));
  console.log(lines.join("\n"));
}

export function logQueryError(
  label: string,
  wallMs: number,
  status: number,
  detail: string,
  sqlFile?: string,
): void {
  const lines = [
    header(label, chalk.red, chalk.red(`✗ HTTP ${status}`)),
    field("wall", fmtMs(wallMs)),
    field("error", chalk.red(detail.slice(0, 300))),
  ];
  if (sqlFile) lines.push(field("sql", chalk.dim(sqlFile)));
  console.error(lines.join("\n"));
}
