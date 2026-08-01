import { log } from './logger';
import { trackingEnabled, disableReason } from './state';
import { buildEventPayload, sendEvent, reportOutcome } from './tracker';
import { toEventData } from './eventData';
import { STORAGE_PREFIX, CUSTOM_EVENT_TYPE } from './constants';
import { EventCallback, IdentifyData } from './types';

const PAGEVIEW_THROTTLE_MS = 60000;

let lastPageviewTime = 0;
let lastPageviewUrl = '';

export function trackPageview(callback?: EventCallback) {
  if (!trackingEnabled) {
    log('info', `Pageview ignored - ${disableReason}`);
    return reportOutcome(callback, 'disabled');
  }
  const now = Date.now();
  const href = window.location.href;
  if (href === lastPageviewUrl && now - lastPageviewTime < PAGEVIEW_THROTTLE_MS) {
    log('info', 'Pageview ignored - throttled (same URL within 1 minute)');
    return reportOutcome(callback, 'throttled');
  }
  lastPageviewTime = now;
  lastPageviewUrl = href;

  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}pageview_state`, JSON.stringify({ time: now, url: href }));
  } catch (e) {}

  const payload = buildEventPayload('pageview');
  if (!payload) return reportOutcome(callback, 'invalid');
  sendEvent(payload, callback);
}

export function trackCustomEvent(type: string, extraData?: Record<string, unknown>, callback?: EventCallback) {
  if (!trackingEnabled) {
    log('info', `Custom event '${type}' ignored - ${disableReason}`);
    return reportOutcome(callback, 'disabled');
  }
  const payload = buildEventPayload(type);
  if (!payload) return reportOutcome(callback, 'invalid');

  payload.extraData = toEventData(extraData ?? {});
  sendEvent(payload, callback);
}

export function trackIdentify(userId: string, data: IdentifyData, callback?: EventCallback) {
  if (!trackingEnabled) {
    log('info', `Identify event ignored - ${disableReason}`);
    return reportOutcome(callback, 'disabled');
  }
  const payload = buildEventPayload('identify');
  if (!payload) return reportOutcome(callback, 'invalid');

  payload.extraData = toEventData({ name: '', image: '', ...data, user_id: userId });
  sendEvent(payload, callback);
}

export function datafastGlobalHandler(eventName: string, data?: Record<string, unknown>) {
  if (!trackingEnabled) {
    log('info', `Event '${eventName}' ignored - ${disableReason}`);
    return;
  }
  if (!eventName) {
    log('warn', 'Missing event_name for custom event');
    return;
  }

  if (eventName === 'identify') {
    if (!data?.user_id) {
      log('warn', `Missing user_id for ${eventName} event`);
      return;
    }
    trackIdentify(data.user_id as string, data as unknown as IdentifyData);
  } else {
    trackCustomEvent(CUSTOM_EVENT_TYPE, { ...(data ?? {}), eventName });
  }
}

export function initPageviewState() {
  try {
    const state = sessionStorage.getItem(`${STORAGE_PREFIX}pageview_state`);
    if (state) {
      const parsed = JSON.parse(state);
      lastPageviewTime = parsed.time || 0;
      lastPageviewUrl = parsed.url || '';
    }
  } catch (t) {
    lastPageviewTime = 0;
    lastPageviewUrl = '';
  }
}
