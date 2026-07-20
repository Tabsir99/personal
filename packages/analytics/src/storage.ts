import { config } from './config';
import { STORAGE_PREFIX, URL_PARAM_PREFIX } from './constants';
import { isLocalhost, isValidDateStr, parseValidInt, generateUUID } from './utils';

function getUrlParam(name: string): string | null {
  try {
    return new URL(window.location.href).searchParams.get(`${URL_PARAM_PREFIX}${name}`);
  } catch {
    return null;
  }
}

export function setCookie(name: string, value: string | number, days?: number) {
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + d.toUTCString();
  }
  let cookieStr = `${name}=${value || ''}${expires}; path=/`;

  if (!isLocalhost(window.location.hostname) && window.location.protocol !== 'file:') {
    const hostname = window.location.hostname;
    if (config.domain) {
      cookieStr +=
        hostname === config.domain || hostname.endsWith('.' + config.domain)
          ? '; domain=.' + config.domain.replace(/^\./, '')
          : '; domain=.' + hostname.replace(/^\./, '');
    } else {
      cookieStr += '; domain=.' + hostname.replace(/^\./, '');
    }
  }
  document.cookie = cookieStr;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

export function getVisitorId(): string {
  let vid = getUrlParam('vid');
  if (vid) {
    setCookie(`${STORAGE_PREFIX}visitor_id`, vid, 365);
    return vid;
  }
  vid = getCookie(`${STORAGE_PREFIX}visitor_id`);
  if (!vid) {
    vid = generateUUID();
    setCookie(`${STORAGE_PREFIX}visitor_id`, vid, 365);
    getVisitorFirstSeenAt();
  }
  return vid;
}

export function getVisitorFirstSeenAt(): string {
  let vfs = getUrlParam('vfs');
  if (isValidDateStr(vfs)) {
    setCookie(`${STORAGE_PREFIX}visitor_first_seen_at`, vfs!, 365);
    return vfs!;
  }
  vfs = getCookie(`${STORAGE_PREFIX}visitor_first_seen_at`);
  if (!isValidDateStr(vfs)) {
    vfs = new Date().toISOString();
    setCookie(`${STORAGE_PREFIX}visitor_first_seen_at`, vfs, 365);
  }
  return vfs!;
}

export function getVisitorSessionNumber(): number {
  const vsnParam = parseValidInt(getUrlParam('vsn'));
  if (vsnParam) {
    setCookie(`${STORAGE_PREFIX}visitor_session_count`, vsnParam, 365);
    return vsnParam;
  }
  const vsnCookie = parseValidInt(getCookie(`${STORAGE_PREFIX}visitor_session_count`));
  if (vsnCookie) return vsnCookie;

  setCookie(`${STORAGE_PREFIX}visitor_session_count`, 1, 365);
  return 1;
}

export function getSessionId(): string {
  let sid = getUrlParam('sid');
  if (sid) {
    setCookie(`${STORAGE_PREFIX}session_id`, sid, 1 / 48);
    return sid;
  }
  sid = getCookie(`${STORAGE_PREFIX}session_id`);
  if (sid) {
    setCookie(`${STORAGE_PREFIX}session_id`, sid, 1 / 48);
  } else {
    sid = 's' + generateUUID().substring(1);
    setCookie(`${STORAGE_PREFIX}session_id`, sid, 1 / 48);
    const current = parseValidInt(getCookie(`${STORAGE_PREFIX}visitor_session_count`));
    const next = current ? current + 1 : 1;
    setCookie(`${STORAGE_PREFIX}visitor_session_count`, next, 365);
  }
  return sid;
}
