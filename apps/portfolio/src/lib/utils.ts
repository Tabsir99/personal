import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

// Swaps <source data-src> to a real src and re-runs resource selection, so
// nothing downloads offscreen. No-op once loaded.
export function loadVideoSources(video: HTMLVideoElement) {
  let changed = false;
  video.querySelectorAll<HTMLSourceElement>("source[data-src]").forEach((s) => {
    if (s.dataset.src) {
      s.src = s.dataset.src;
      delete s.dataset.src;
      changed = true;
    }
  });
  if (changed) video.load();
}
