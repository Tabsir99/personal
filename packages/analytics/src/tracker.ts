import { config } from './config';
import { log } from './logger';
import { apiUrl } from './state';
import { STORAGE_PREFIX, MAX_HREF_LENGTH, HANDOFF_PARAMS } from './constants';
import { getVisitorId, getSessionId, getVisitorSessionNumber, setCookie } from './storage';
import { isBot } from './bot';
import { EventPayload, EventCallback } from './types';

const SESSION_COOKIE_LIFETIME_DAYS = 30 / (60 * 24);

export function buildEventPayload(type: string): EventPayload | undefined {
  const href = window.location.href;
  if (!href) {
    log('warn', 'Unable to collect href. This may indicate incorrect script implementation or browser issues.');
    return;
  }
  const { websiteId, domain } = config;
  if (!websiteId || !domain) {
    log('warn', 'Unable to build an event payload without a website ID and domain.');
    return;
  }
  const payload: EventPayload = {
    websiteId,
    domain,
    type,
    href: href.slice(0, MAX_HREF_LENGTH),
    referrer: document.referrer || null,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    visitorSessionNumber: getVisitorSessionNumber(),
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screenWidth: screen.width || 0,
    screenHeight: screen.height || 0,
  };

  try {
    const u = new URL(window.location.href);
    const handoffPresent = HANDOFF_PARAMS.filter((param) => u.searchParams.has(param));
    if (handoffPresent.length > 0) {
      for (const param of handoffPresent) u.searchParams.delete(param);
      window.history.replaceState({}, '', u.toString());
    }
  } catch {}

  return payload;
}

export function sendEvent(payload: EventPayload, callback?: EventCallback) {
  if (localStorage.getItem(`${STORAGE_PREFIX}ignore`) === 'true') {
    log('info', 'Event ignored - tracking disabled via localStorage flag');
    if (callback) callback({ status: 200 });
    return;
  }
  if (isBot()) {
    log('info', 'Event ignored - bot detected');
    if (callback) callback({ status: 200 });
    return;
  }

  setCookie(`${STORAGE_PREFIX}session_id`, getSessionId(), SESSION_COOKIE_LIFETIME_DAYS);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', apiUrl, true);
  xhr.setRequestHeader('Content-Type', 'text/plain');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        log('info', `${payload.type || 'Event'} tracked successfully`);
      } else {
        log('error', `Failed to track ${payload.type || 'event'} - HTTP ${xhr.status}`);
      }
      if (callback) callback({ status: xhr.status });
    }
  };
  xhr.send(JSON.stringify(payload));
}
