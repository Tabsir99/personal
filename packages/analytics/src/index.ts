import { initConfigState, trackingEnabled, disableReason } from './state';
import { log } from './logger';
import { cgdGlobalHandler, initPageviewState } from './events';
import { initDom } from './dom';
import { setupSpaRouting } from './spa';
import { APP_NAME } from './constants';

(function () {
  'use strict';

  let queue: any[] = [];
  const globalObj = (window as any)[APP_NAME];
  if (globalObj && globalObj.q && Array.isArray(globalObj.q)) {
    queue = globalObj.q.map((t: any) => Array.from(t));
  }

  initConfigState();

  (window as any)[APP_NAME] = cgdGlobalHandler;
  if ((window as any)[APP_NAME].q) {
    delete (window as any)[APP_NAME].q;
  }

  while (queue.length > 0) {
    const item = queue.shift();
    if (Array.isArray(item) && item.length > 0) {
      try {
        (cgdGlobalHandler as any).apply(null, item as any);
      } catch (e) {
        log('error', 'Error processing queued call:', e, item);
      }
    }
  }

  if (!trackingEnabled) {
    log('warn', disableReason);
    return;
  }

  initPageviewState();
  initDom();
  setupSpaRouting();
})();
