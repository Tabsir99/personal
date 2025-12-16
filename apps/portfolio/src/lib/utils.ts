export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate Next.js optimized image URL for <img> tag
 * @param url - original image path (absolute or relative)
 * @param width - requested width in pixels
 * @param quality - optional quality 1-100 (default 75)
 */
export function nextImageUrl(url: string, width: number, quality = 75) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}
