import { setConfig } from './config';
import { CUSTOM_EVENT_TYPE } from './constants';
import { initConfigState, trackingEnabled } from './state';
import {
  trackPageview as _trackPageview,
  trackCustomEvent as _trackCustomEvent,
  trackIdentify as _trackIdentify,
  initPageviewState,
} from './events';
import { initDom } from './dom';
import { setupSpaRouting } from './spa';
import type { AnalyticsConfig, IdentifyData, EventCallback, EventResult, EventOutcome } from './types';

let initialized = false;

function inBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

interface AnalyticsInstance {
  trackPageview: (callback?: EventCallback) => void;
  trackEvent: (name: string, data?: Record<string, string>, callback?: EventCallback) => void;
  identify: (userId: string, data?: IdentifyData, callback?: EventCallback) => void;
}

const methods: AnalyticsInstance = {
  trackPageview(callback?: EventCallback): void {
    _trackPageview(callback);
  },
  trackEvent(name: string, data?: Record<string, string>, callback?: EventCallback): void {
    _trackCustomEvent(CUSTOM_EVENT_TYPE, { ...data, eventName: name }, callback);
  },
  identify(userId: string, data?: IdentifyData, callback?: EventCallback): void {
    _trackIdentify(userId, data ?? {}, callback);
  },
};

export function init(options: AnalyticsConfig): AnalyticsInstance {
  if (initialized) return methods;
  if (!inBrowser()) return methods;

  setConfig({
    websiteId: options.websiteId,
    domain: options.domain,
    apiUrlRaw: options.apiUrl ?? null,
    debug: options.debug ?? false,
    disableConsole: options.disableConsole ?? false,
    allowLocalhost: options.allowLocalhost ?? false,
    allowIframe: options.allowIframe ?? false,
    allowedHostnames: options.allowedHostnames ?? [],
    allowFileProtocol: false,
  });

  initConfigState();
  initialized = true;

  if (!trackingEnabled) return methods;

  initPageviewState();
  initDom();
  setupSpaRouting();

  return methods;
}

export type { AnalyticsConfig, IdentifyData, EventCallback, EventResult, EventOutcome, AnalyticsInstance };
export * from './constants';
