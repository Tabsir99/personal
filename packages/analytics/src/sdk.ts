import { setConfig } from './config';
import { initConfigState } from './state';
import {
  trackPageview as _trackPageview,
  trackCustomEvent as _trackCustomEvent,
  trackIdentify as _trackIdentify,
  initPageviewState,
} from './events';
import { initDom } from './dom';
import { setupSpaRouting } from './spa';
import type { AnalyticsConfig, IdentifyData, EventCallback } from './types';

let initialized = false;

interface AnalyticsInstance {
  /**
   * Track a pageview. Automatically called on route changes
   * after `init()`, but can be called manually if needed.
   */
  trackPageview: (callback?: EventCallback) => void;
  /**
   * Track a custom event with optional key-value data.
   *
   * @example
   * ```ts
   * analytics.trackEvent('signup', { plan: 'pro', source: 'hero_cta' });
   * ```
   */
  trackEvent: (name: string, data?: Record<string, string>, callback?: EventCallback) => void;
  /**
   * Identify a visitor with a user ID and profile data.
   * Links anonymous visitor sessions to a known user.
   *
   * @example
   * ```ts
   * analytics.identify('user-123', { name: 'Jane', image: 'https://...' });
   * ```
   */
  identify: (userId: string, data?: IdentifyData, callback?: EventCallback) => void;
}

const methods: AnalyticsInstance = {
  trackPageview(callback?: EventCallback): void {
    _trackPageview(callback);
  },
  trackEvent(name: string, data?: Record<string, string>, callback?: EventCallback): void {
    _trackCustomEvent(name, data, callback);
  },
  identify(userId: string, data?: IdentifyData, callback?: EventCallback): void {
    _trackIdentify(userId, data ?? {}, callback);
  },
};

/**
 * Initialize the analytics tracker programmatically.
 * Call once at app startup before any tracking calls.
 * Returns the tracking methods.
 *
 * @example
 * ```ts
 * import { init } from '@tabsircg/analytics/sdk';
 *
 * const analytics = init({
 *   websiteId: 'your-website-id',
 *   domain: 'example.com',
 *   apiUrl: '/api/events',
 * });
 *
 * analytics.trackEvent('signup');
 * ```
 */
export function init(options: AnalyticsConfig): AnalyticsInstance {
  if (initialized) return methods;

  setConfig({
    websiteId: options.websiteId,
    domain: options.domain,
    apiUrlRaw: options.apiUrl ?? null,
    debug: options.debug ?? false,
    disableConsole: options.disableConsole ?? false,
    allowLocalhost: options.allowLocalhost ?? false,
    allowedHostnames: options.allowedHostnames ?? [],
    allowFileProtocol: false,
  });

  initConfigState();
  initPageviewState();

  if (typeof document !== 'undefined') {
    initDom();
  }

  if (typeof window !== 'undefined') {
    setupSpaRouting();
  }

  initialized = true;
  return methods;
}

export type { AnalyticsConfig, IdentifyData, EventCallback, AnalyticsInstance };
export * from './constants';
