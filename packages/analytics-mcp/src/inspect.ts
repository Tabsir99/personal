import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".html", ".svelte", ".vue", ".astro"];
const SKIP_DIRECTORIES = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage", ".turbo"]);
const MAX_FILES = 4000;

const MIDDLEWARE_IMPORT = /from\s+["']@tabsircg\/analytics\/middleware["']/;
const CRAWLER_ENTRYPOINT = /\b(?:trackCrawler|withCrawlerTracking|expressCrawlerMiddleware|honoCrawlerMiddleware)\s*\(/;

const RISKY_FLAGS = [
  { pattern: /allowLocalhost:\s*true|data-allow-localhost/, note: "allowLocalhost is on - localhost traffic will be recorded as real visits" },
  { pattern: /allowIframe:\s*true|data-allow-iframe/, note: "allowIframe is on - the tracker will run inside embeds of your page" },
  { pattern: /debug:\s*true|data-debug/, note: "debug is on - the tracker logs every event to the console" },
];

async function sourceFiles(root: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(dir: string) {
    if (found.length >= MAX_FILES) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (found.length >= MAX_FILES) return;
      if (entry.name.startsWith(".") && entry.name !== ".env") continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) await walk(full);
      } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        found.push(full);
      }
    }
  }

  await walk(root);
  return found;
}

async function installedVersion(root: string): Promise<string | null> {
  for (const path of [
    join(root, "node_modules", "@tabsircg", "analytics", "package.json"),
    join(root, "package.json"),
  ]) {
    try {
      const parsed = JSON.parse(await readFile(path, "utf8"));
      if (parsed.name === "@tabsircg/analytics") return parsed.version;
      const declared = parsed.dependencies?.["@tabsircg/analytics"] ?? parsed.devDependencies?.["@tabsircg/analytics"];
      if (declared) return `${declared} (declared, not resolved)`;
    } catch {
      continue;
    }
  }
  return null;
}

export async function inspectSetup(root: string): Promise<string> {
  const lines: string[] = [];
  const version = await installedVersion(root);
  lines.push(version ? `@tabsircg/analytics: ${version}` : "@tabsircg/analytics is not a dependency of this project.");

  const files = await sourceFiles(root);
  const initSites: string[] = [];
  const scriptSites: string[] = [];
  const crawlerSites: string[] = [];
  const filesInvolved = new Set<string>();
  const warnings = new Set<string>();

  for (const file of files) {
    let text;
    try {
      text = await readFile(file, "utf8");
    } catch {
      continue;
    }
    if (!text.includes("tabsircg/analytics") && !text.includes("data-website-id")) continue;

    const where = relative(root, file);
    const crawlerLines: string[] = [];

    text.split("\n").forEach((line, index) => {
      const site = `${where}:${index + 1}  ${line.trim().slice(0, 120)}`;
      if (MIDDLEWARE_IMPORT.test(line) || CRAWLER_ENTRYPOINT.test(line)) {
        crawlerLines.push(site);
      } else if (/\binit\s*\(/.test(line) || /from\s+["']@tabsircg\/analytics/.test(line)) {
        initSites.push(site);
        filesInvolved.add(where);
      }
      if (line.includes("data-website-id")) {
        scriptSites.push(site);
        filesInvolved.add(where);
      }
      for (const flag of RISKY_FLAGS) {
        if (flag.pattern.test(line)) warnings.add(`${flag.note} (${where}:${index + 1})`);
      }
    });

    if (crawlerLines.length > 0) {
      crawlerSites.push(...crawlerLines);
      if (!text.includes("ingestToken")) {
        warnings.add(`crawler tracking in ${where} passes no ingestToken - the Worker 403s every crawl event and nothing is logged`);
      }
    }
  }

  lines.push("");
  if (initSites.length === 0 && scriptSites.length === 0 && crawlerSites.length === 0) {
    lines.push("No tracker setup found. Nothing imports @tabsircg/analytics and no script tag carries data-website-id.");
    lines.push("Read the analytics://reference resource for the install paths.");
    return lines.join("\n");
  }

  if (initSites.length > 0) {
    lines.push("SDK usage:");
    for (const site of initSites.slice(0, 20)) lines.push(`  ${site}`);
  }
  if (scriptSites.length > 0) {
    lines.push("Script tag:");
    for (const site of scriptSites.slice(0, 20)) lines.push(`  ${site}`);
  }
  if (crawlerSites.length > 0) {
    lines.push("Crawler middleware:");
    for (const site of crawlerSites.slice(0, 20)) lines.push(`  ${site}`);
  }

  if (initSites.length > 0 && scriptSites.length > 0 && filesInvolved.size > 1) {
    lines.push("");
    lines.push("Both the script tag and the SDK are present. Use one - two initialisations double every pageview.");
  } else if (filesInvolved.size === 1) {
    lines.push("");
    lines.push("The browser tracker setup is all in one file, so it is likely a snippet or a docs component rather than a live installation.");
  }

  if (crawlerSites.length === 0) {
    lines.push("");
    lines.push("No crawler tracking. The browser tracker only runs where JavaScript runs, so AI crawlers, unfurlers and SEO bots are absent from this site's data entirely.");
    lines.push("Add @tabsircg/analytics/middleware on the server - see the analytics://reference resource.");
  }

  if (warnings.size > 0) {
    lines.push("");
    lines.push("Check before shipping:");
    for (const warning of warnings) lines.push(`  - ${warning}`);
  }

  return lines.join("\n");
}
