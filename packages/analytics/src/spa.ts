import { trackPageview } from './events';

export function setupSpaRouting() {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function triggerPageview() {
    trackPageview();
  }

  function handleRoute() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(triggerPageview, 100);
  }

  let currentPath = window.location.pathname;

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    originalPushState.apply(this, args);
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      handleRoute();
    }
  };

  window.addEventListener('popstate', function () {
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      handleRoute();
    }
  });

  // Initial trigger
  triggerPageview();
}
