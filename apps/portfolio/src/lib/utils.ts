import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
}

// Lazy <video>: VoicesPlayer renders <source data-src> with no real src, so
// nothing downloads offscreen. Swap the deferred URLs in and re-run resource
// selection (the browser then fetches only the codec it supports). No-op once
// loaded. Shared by the scroll observer, the work-section activation, and the
// player's own play() safety net.
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
