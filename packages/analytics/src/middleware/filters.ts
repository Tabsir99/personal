const IGNORED_PATH_PREFIXES = [
  '/api',
  '/_next',
  '/_nuxt',
  '/_astro',
  '/static',
  '/assets',
  '/public',
  '/images',
  '/img',
  '/fonts',
  '/favicon',
  '/build',
  '/dist',
  '/cdn-cgi',
  '/.well-known',
];

const IGNORED_EXTENSIONS = new Set([
  'avif', 'bmp', 'br', 'css', 'csv', 'eot', 'gif', 'gz', 'ico', 'jpeg', 'jpg', 'js', 'json', 'map', 'mjs',
  'mov', 'mp3', 'mp4', 'otf', 'pdf', 'png', 'svg', 'ttf', 'txt', 'wasm', 'wav', 'webm', 'webmanifest',
  'webp', 'woff', 'woff2', 'xml', 'zip',
]);

const CRAWLER_FACING_PATHS = new Set(['/robots.txt', '/llms.txt', '/llms-full.txt']);

function normalizePathname(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, '/').toLowerCase();
}

function isCrawlerFacing(pathname: string): boolean {
  if (CRAWLER_FACING_PATHS.has(pathname)) return true;
  const lastSegment = pathname.split('/').pop() ?? '';
  return lastSegment.includes('sitemap') && lastSegment.endsWith('.xml');
}

export function ignoreStaticPaths(url: URL): boolean {
  const pathname = normalizePathname(url.pathname);
  if (isCrawlerFacing(pathname)) return true;
  if (IGNORED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return false;
  const extension = /\.([a-z0-9]+)$/.exec(pathname.split('/').pop() ?? '')?.[1];
  return !extension || !IGNORED_EXTENSIONS.has(extension);
}
