import { config } from './config';
import { trackCustomEvent } from './events';
import { getVisitorId, getSessionId, getVisitorFirstSeenAt, getVisitorSessionNumber } from './storage';
import { log } from './logger';
import {
  GOAL_ATTR,
  GOAL_PROP_PREFIX,
  SCROLL_ATTR,
  SCROLL_PROP_PREFIX,
  SCROLL_THRESHOLD_ATTR,
  SCROLL_DELAY_ATTR,
  URL_PARAM_PREFIX,
} from './constants';

export function getBaseDomain(hostname: string | null) {
  if (!hostname) return null;
  const parts = hostname.replace(/^www\./, '').split('.');
  return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
}

export function isInternalDomain(hostname: string | null): boolean {
  if (!hostname) return false;
  if (hostname === config.domain) return true;
  for (const allowed of config.allowedHostnames) {
    if (hostname === allowed) return true;
  }
  return false;
}

export function handleOutboundLink(el: HTMLAnchorElement | null) {
  if (!el || !el.href) return;
  try {
    const url = new URL(el.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    const targetHost = url.hostname;
    const currentHost = window.location.hostname;

    if (targetHost === currentHost) return;
    if (getBaseDomain(targetHost) === getBaseDomain(currentHost)) return;

    if (!isInternalDomain(targetHost)) {
      trackCustomEvent('external_link', { url: el.href, text: el.textContent?.trim() || '' });
    } else {
      el.href = (function (href: string) {
        try {
          const u = new URL(href);
          u.searchParams.set(`${URL_PARAM_PREFIX}vid`, getVisitorId());
          u.searchParams.set(`${URL_PARAM_PREFIX}sid`, getSessionId());
          u.searchParams.set(`${URL_PARAM_PREFIX}vfs`, getVisitorFirstSeenAt());
          u.searchParams.set(`${URL_PARAM_PREFIX}vsn`, getVisitorSessionNumber().toString());
          return u.toString();
        } catch {
          return href;
        }
      })(el.href);
    }
  } catch (e) {}
}

export function handleGoalElement(el: Element | null) {
  if (!el) return;
  const goalName = el.getAttribute(GOAL_ATTR);
  if (goalName && goalName.trim()) {
    const customData: Record<string, string> = { eventName: goalName.trim() };
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (attr.name.startsWith(GOAL_PROP_PREFIX)) {
        const propName = attr.name.substring(GOAL_PROP_PREFIX.length);
        if (propName) {
          customData[propName.replace(/-/g, '_')] = attr.value;
        }
      }
    }
    trackCustomEvent('custom', customData);
  }
}

export function setupDomListeners() {
  document.addEventListener('click', function (e) {
    const target = e.target as Element;
    if (target.closest) {
      const goalEl = target.closest(`[${GOAL_ATTR}]`);
      if (goalEl) handleGoalElement(goalEl);
      handleOutboundLink(target.closest('a') as HTMLAnchorElement | null);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as Element;
      if (target.closest) {
        const goalEl = target.closest(`[${GOAL_ATTR}]`);
        if (goalEl) handleGoalElement(goalEl);
        handleOutboundLink(target.closest('a') as HTMLAnchorElement | null);
      }
    }
  });
}

const observedElements = new WeakSet();
const observerMap = new Map<number, IntersectionObserver>();
const scrollStateMap = new WeakMap();

function handleScrollTrigger(el: Element, isIntersecting: boolean) {
  const goalName = el.getAttribute(SCROLL_ATTR);
  if (!goalName || !goalName.trim()) return;

  let state = scrollStateMap.get(el);
  if (!state) {
    state = { fired: false, pendingTimeout: null };
    scrollStateMap.set(el, state);
  }

  if (!isIntersecting) {
    if (state.pendingTimeout !== null) {
      clearTimeout(state.pendingTimeout);
      state.pendingTimeout = null;
    }
    state.fired = false;
    return;
  }

  if (state.fired || state.pendingTimeout !== null) return;

  const delayAttr = el.getAttribute(SCROLL_DELAY_ATTR);
  let delay = 0;
  if (delayAttr !== null) {
    const d = parseInt(delayAttr, 10);
    if (!isNaN(d) && d >= 0) delay = d;
  }

  const fire = () => {
    state.pendingTimeout = null;
    const rect = el.getBoundingClientRect();
    if (!(rect.bottom > 0 && rect.top < window.innerHeight)) return;

    state.fired = true;

    const currentScroll = (function () {
      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const wh = window.innerHeight;
      const py = window.pageYOffset || document.documentElement.scrollTop;
      const diff = maxScroll - wh;
      return diff <= 0 ? 100 : Math.min(100, Math.round((py / diff) * 100));
    })();

    const thresholdAttr = el.getAttribute(SCROLL_THRESHOLD_ATTR);
    let threshold = 0.5;
    if (thresholdAttr !== null) {
      const t = parseFloat(thresholdAttr);
      if (!isNaN(t) && t >= 0 && t <= 1) threshold = t;
    }

    const customData: Record<string, string> = {
      eventName: goalName.trim(),
      scroll_percentage: currentScroll.toString(),
      threshold: threshold.toString(),
      delay: delay.toString(),
    };

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (
        attr.name.startsWith(SCROLL_PROP_PREFIX) &&
        attr.name !== SCROLL_THRESHOLD_ATTR &&
        attr.name !== SCROLL_DELAY_ATTR
      ) {
        const propName = attr.name.substring(SCROLL_PROP_PREFIX.length);
        if (propName) {
          customData[propName.replace(/-/g, '_')] = attr.value;
        }
      }
    }

    trackCustomEvent('custom', customData);
  };

  if (delay > 0) {
    state.pendingTimeout = setTimeout(fire, delay);
  } else {
    fire();
  }
}

function observeScrollElements(elements: NodeListOf<Element>) {
  if (!window.IntersectionObserver) return;
  elements.forEach((el) => {
    if (observedElements.has(el)) return;

    const thresholdAttr = el.getAttribute(SCROLL_THRESHOLD_ATTR);
    let threshold = 0.5;
    if (thresholdAttr !== null) {
      const t = parseFloat(thresholdAttr);
      if (!isNaN(t) && t >= 0 && t <= 1) {
        threshold = t;
      } else {
        log('warn', `Invalid threshold value "${thresholdAttr}" for element. Using default 0.5.`);
      }
    }

    const getObserver = (t: number) => {
      if (observerMap.has(t)) return observerMap.get(t);
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            handleScrollTrigger(entry.target, entry.isIntersecting);
          });
        },
        { root: null, rootMargin: '0px', threshold: [0, t] }
      );
      observerMap.set(t, obs);
      return obs;
    };

    const observer = getObserver(threshold);
    observer?.observe(el);
    observedElements.add(el);
  });
}

export function setupScrollTracking() {
  if (!window.IntersectionObserver) {
    log('warn', 'Intersection Observer not supported, scroll tracking disabled');
    return;
  }

  observeScrollElements(document.querySelectorAll(`[${SCROLL_ATTR}]`));

  if (window.MutationObserver) {
    new MutationObserver((mutations) => {
      let shouldReobserve = false;
      mutations.forEach((m) => {
        if (
          (m.type === 'childList' && m.addedNodes.length > 0) ||
          (m.type === 'attributes' && m.attributeName === SCROLL_ATTR)
        ) {
          shouldReobserve = true;
        }
      });
      if (shouldReobserve) {
        observeScrollElements(document.querySelectorAll(`[${SCROLL_ATTR}]`));
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [SCROLL_ATTR],
    });
  }
}

export function initDom() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScrollTracking);
  } else {
    setupScrollTracking();
  }
  setupDomListeners();
}
