import { config } from './config';
import { log } from './logger';
import { apiUrl } from './state';
import { STORAGE_PREFIX, URL_PARAM_PREFIX } from './constants';
import { getVisitorId, getSessionId, getVisitorFirstSeenAt, getVisitorSessionNumber, setCookie } from './storage';
import { isBot } from './bot';
import { EventPayload, EventCallback } from './types';

export function buildEventPayload(): EventPayload | undefined {
  const href = window.location.href;
  if (!href) {
    log('warn', 'Unable to collect href. This may indicate incorrect script implementation or browser issues.');
    return;
  }
  const payload: EventPayload = {
    websiteId: config.websiteId,
    domain: config.domain,
    href: href,
    referrer: document.referrer || null,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    visitorFirstSeenAt: getVisitorFirstSeenAt(),
    visitorSessionNumber: getVisitorSessionNumber(),
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screenWidth: screen.width || 0,
    screenHeight: screen.height || 0,
  };

  try {
    const u = new URL(window.location.href);
    if (
      u.searchParams.has(`${URL_PARAM_PREFIX}vid`) ||
      u.searchParams.has(`${URL_PARAM_PREFIX}sid`) ||
      u.searchParams.has(`${URL_PARAM_PREFIX}vfs`) ||
      u.searchParams.has(`${URL_PARAM_PREFIX}vsn`)
    ) {
      u.searchParams.delete(`${URL_PARAM_PREFIX}vid`);
      u.searchParams.delete(`${URL_PARAM_PREFIX}sid`);
      u.searchParams.delete(`${URL_PARAM_PREFIX}vfs`);
      u.searchParams.delete(`${URL_PARAM_PREFIX}vsn`);
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

  const xhr = new XMLHttpRequest();
  xhr.open('POST', apiUrl, true);
  xhr.setRequestHeader('Content-Type', 'text/plain');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        log('info', `${payload.type || 'Event'} tracked successfully`);
        setCookie(`${STORAGE_PREFIX}session_id`, getSessionId(), 1 / 48);
      } else {
        log('error', `Failed to track ${payload.type || 'event'} - HTTP ${xhr.status}`);
      }
      if (callback) callback({ status: xhr.status });
    }
  };
  xhr.send(JSON.stringify(payload));
}
