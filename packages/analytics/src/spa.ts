import { trackPageview } from './events';

const ROUTE_DEBOUNCE_MS = 100;

export function routeKey(href: string): string {
  try {
    return new URL(href).pathname;
  } catch {
    return href;
  }
}

function currentRoute(): string {
  return routeKey(window.location.href);
}

export function setupSpaRouting() {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let currentPath = currentRoute();

  function handleRoute() {
    const nextPath = currentRoute();
    if (nextPath === currentPath) return;
    currentPath = nextPath;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => trackPageview(), ROUTE_DEBOUNCE_MS);
  }

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleRoute();
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleRoute();
  };

  window.addEventListener('popstate', handleRoute);

  trackPageview();
}
