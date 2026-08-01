import { config } from './config';
import { trackCustomEvent } from './events';
import { getVisitorId, getSessionId, getVisitorSessionNumber } from './storage';
import { log } from './logger';
import {
  GOAL_ATTR,
  GOAL_PROP_PREFIX,
  SCROLL_ATTR,
  SCROLL_PROP_PREFIX,
  SCROLL_THRESHOLD_ATTR,
  SCROLL_DELAY_ATTR,
  URL_PARAM_PREFIX,
  CUSTOM_EVENT_TYPE,
} from './constants';

function isWithin(hostname: string, root: string): boolean {
  return hostname === root || hostname.endsWith(`.${root}`);
}

export function declaredHostnames(): string[] {
  return [config.domain, ...config.allowedHostnames].filter((host): host is string => Boolean(host));
}

export function isSameSite(targetHost: string, currentHost: string): boolean {
  if (targetHost === currentHost) return true;
  if (isWithin(targetHost, currentHost) || isWithin(currentHost, targetHost)) return true;
  return declaredHostnames().some((root) => isWithin(targetHost, root) && isWithin(currentHost, root));
}

export function isInternalDomain(hostname: string | null): boolean {
  if (!hostname) return false;
  return declaredHostnames().some((root) => isWithin(hostname, root));
}

export function handleOutboundLink(el: HTMLAnchorElement | null) {
  if (!el || !el.href) return;
  try {
    const url = new URL(el.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    const targetHost = url.hostname;
    const currentHost = window.location.hostname;

    if (isSameSite(targetHost, currentHost)) return;

    if (!isInternalDomain(targetHost)) {
      trackCustomEvent('external_link', { url: el.href, text: el.textContent?.trim() || '' });
    } else {
      el.href = (function (href: string) {
        try {
          const u = new URL(href);
          u.searchParams.set(`${URL_PARAM_PREFIX}vid`, getVisitorId());
          u.searchParams.set(`${URL_PARAM_PREFIX}sid`, getSessionId());
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
    trackCustomEvent(CUSTOM_EVENT_TYPE, customData);
  }
}

const NATIVELY_CLICKABLE = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'];

function emitsSyntheticClick(target: Element): boolean {
  const el = target.closest(NATIVELY_CLICKABLE.join(','));
  return Boolean(el) && !(el as HTMLElement).isContentEditable;
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
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.target as Element;
    if (!target.closest || emitsSyntheticClick(target)) return;

    const goalEl = target.closest(`[${GOAL_ATTR}]`);
    if (goalEl) handleGoalElement(goalEl);
    handleOutboundLink(target.closest('a') as HTMLAnchorElement | null);
  });
}

const observedElements = new WeakSet();
const observerMap = new Map<number, IntersectionObserver>();
const scrollStateMap = new WeakMap();

const DEFAULT_SCROLL_THRESHOLD = 0.5;

function thresholdFor(el: Element): number {
  const raw = el.getAttribute(SCROLL_THRESHOLD_ATTR);
  if (raw === null) return DEFAULT_SCROLL_THRESHOLD;
  const parsed = parseFloat(raw);
  if (isNaN(parsed) || parsed < 0 || parsed > 1) return DEFAULT_SCROLL_THRESHOLD;
  return parsed;
}

function handleScrollTrigger(el: Element, isIntersecting: boolean, meetsThreshold: boolean) {
  const goalName = el.getAttribute(SCROLL_ATTR);
  if (!goalName || !goalName.trim()) return;

  let state = scrollStateMap.get(el);
  if (!state) {
    state = { fired: false, pendingTimeout: null };
    scrollStateMap.set(el, state);
  }

  if (!isIntersecting || !meetsThreshold) {
    if (state.pendingTimeout !== null) {
      clearTimeout(state.pendingTimeout);
      state.pendingTimeout = null;
    }
    if (!isIntersecting) state.fired = false;
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

    const customData: Record<string, string> = {
      eventName: goalName.trim(),
      scroll_percentage: currentScroll.toString(),
      threshold: thresholdFor(el).toString(),
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

    trackCustomEvent(CUSTOM_EVENT_TYPE, customData);
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
    const threshold = thresholdFor(el);
    if (thresholdAttr !== null && parseFloat(thresholdAttr) !== threshold) {
      log(
        'warn',
        `Invalid threshold "${thresholdAttr}". Use a fraction between 0 and 1; falling back to ${DEFAULT_SCROLL_THRESHOLD}.`
      );
    }

    const getObserver = (t: number) => {
      if (observerMap.has(t)) return observerMap.get(t);
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            handleScrollTrigger(entry.target, entry.isIntersecting, entry.intersectionRatio >= t);
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
