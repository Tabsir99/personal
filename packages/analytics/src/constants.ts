export const APP_NAME = 'cgd';
export const API_URL = 'https://analytics.tabsircg.com/api/events';
export const MAX_HREF_LENGTH = 2000;
export const ATTR_PREFIX = `data-${APP_NAME}`;
export const STORAGE_PREFIX = `${APP_NAME}_`;
export const URL_PARAM_PREFIX = `_${APP_NAME}_`;

export const GOAL_ATTR = `${ATTR_PREFIX}-goal`;
export const GOAL_PROP_PREFIX = `${GOAL_ATTR}-`;
export const SCROLL_ATTR = `${ATTR_PREFIX}-scroll`;
export const SCROLL_PROP_PREFIX = `${SCROLL_ATTR}-`;
export const SCROLL_THRESHOLD_ATTR = `${SCROLL_ATTR}-threshold`;
export const SCROLL_DELAY_ATTR = `${SCROLL_ATTR}-delay`;

export const HANDOFF_PARAMS = ['vid', 'sid', 'vsn'].map((key) => `${URL_PARAM_PREFIX}${key}`);

export const CUSTOM_EVENT_TYPE = 'custom';

export const VISITOR_ID_MAX_LENGTH = 100;

// Mirrors UUID_PATTERN in @tabsircg/schemas/analytics; validation.test.ts
// asserts the two stay equal.
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const EXTRA_DATA_MAX_PROPERTIES = 10;
export const EXTRA_DATA_MAX_KEY_LENGTH = 32;
export const EXTRA_DATA_MAX_VALUE_LENGTH = 1000;
export const EXTRA_DATA_MAX_BYTES = 4000;
export const EXTRA_DATA_KEY_PATTERN = /^[a-z0-9_-]+$/;
export const EVENT_NAME_KEY = 'eventName';
