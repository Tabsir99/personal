export function cn(
  ...classes: (string | false | null | undefined)[]
) {
  return classes.filter(Boolean).join(" ");
}

export function nextImageUrl(url: string, width: number, quality = 75) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}
