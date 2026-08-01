import { log } from './logger';
import { trackingEnabled, disableReason } from './state';
import { buildEventPayload, sendEvent } from './tracker';
import { sanitizeEventData } from './validation';
import { STORAGE_PREFIX } from './constants';
import { EventCallback, IdentifyData } from './types';

let lastPageviewTime = 0;
let lastPageviewUrl = '';

export function trackPageview(callback?: EventCallback) {
  if (!trackingEnabled) {
    log('info', `Pageview ignored - ${disableReason}`);
    if (callback) callback({ status: 200 });
    return;
  }
  const now = Date.now();
  const href = window.location.href;
  if (href === lastPageviewUrl && now - lastPageviewTime < 60000) {
    log('info', 'Pageview ignored - throttled (same URL within 1 minute)');
    if (callback) callback({ status: 200 });
    return;
  }
  lastPageviewTime = now;
  lastPageviewUrl = href;

  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}pageview_state`, JSON.stringify({ time: now, url: href }));
  } catch (e) {}

  const payload = buildEventPayload('pageview');
  if (payload) sendEvent(payload, callback);
}

export function trackCustomEvent(
  eventName: string,
  extraData?: Record<string, unknown>,
  callback?: EventCallback
) {
  if (!trackingEnabled) {
    log('info', `Custom event '${eventName}' ignored - ${disableReason}`);
    if (callback) callback({ status: 200 });
    return;
  }
  const sanitized = sanitizeEventData(extraData ?? {});
  if (sanitized === null) {
    log('error', `Custom event '${eventName}' rejected due to validation errors`);
    return;
  }
  const payload = buildEventPayload(eventName);
  if (!payload) return;

  payload.extraData = sanitized;
  sendEvent(payload, callback);
}

export function trackIdentify(userId: string, data: IdentifyData, callback?: EventCallback) {
  if (!trackingEnabled) {
    log('info', `Identify event ignored - ${disableReason}`);
    if (callback) callback({ status: 200 });
    return;
  }
  const identity = sanitizeEventData({ name: '', image: '', ...data, user_id: userId });
  if (identity === null) {
    log('error', 'Identify event rejected due to validation errors');
    return;
  }
  const payload = buildEventPayload('identify');
  if (!payload) return;

  payload.extraData = identity;
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
    trackCustomEvent('custom', { ...(data ?? {}), eventName });
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
