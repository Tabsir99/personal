import { config, scriptTag } from './config';
import { isLocalhost } from './utils';
import { isBot } from './bot';
import { log } from './logger';
import { API_URL, SCRIPT_DOMAIN } from './constants';

export let trackingEnabled = true;
export let disableReason = '';
export let apiUrl = API_URL;
export const defaultApiUrl = apiUrl;

export function initConfigState() {
  if (config.apiUrlRaw) {
    try {
      new URL(config.apiUrlRaw);
      apiUrl = config.apiUrlRaw;
    } catch (t) {
      try {
        apiUrl = new URL(config.apiUrlRaw, window.location.origin).href;
      } catch (e) {
        // Fallback handled in logic flow
        apiUrl = defaultApiUrl;
      }
    }
  } else if (scriptTag) {
    const isCustomSrc = !scriptTag.src.includes(SCRIPT_DOMAIN);
    apiUrl = isCustomSrc ? new URL('/api/events', window.location.origin).href : apiUrl;
  }

  if (trackingEnabled && isBot()) {
    trackingEnabled = false;
    disableReason = 'Tracking disabled - bot detected';
  }

  if (
    trackingEnabled &&
    ((isLocalhost(window.location.hostname) && !config.allowLocalhost) ||
      (window.location.protocol === 'file:' && !config.allowFileProtocol))
  ) {
    trackingEnabled = false;
    disableReason =
      window.location.protocol === 'file:'
        ? "Tracking disabled on file protocol (use data-allow-file-protocol='true' to enable)"
        : "Tracking disabled on localhost (use data-allow-localhost='true' to enable)";
  }

  if (trackingEnabled && window !== window.parent && !config.debug) {
    trackingEnabled = false;
    disableReason = 'Tracking disabled inside an iframe';
  }

  if (trackingEnabled && !(config.websiteId && config.domain)) {
    trackingEnabled = false;
    disableReason = 'Missing website ID or domain';
  }

  if (!trackingEnabled) {
    log('warn', disableReason);
  }
}
