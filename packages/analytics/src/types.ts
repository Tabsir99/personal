export interface EventPayload {
  websiteId: string;
  domain: string;
  href: string;
  referrer: string | null;
  viewport: { width: number; height: number };
  visitorId: string;
  sessionId: string;
  visitorSessionNumber: number;
  language: string;
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  type: string;
  extraData?: Record<string, string>;
}

export interface IdentifyData {
  user_id?: string;
  name?: string;
  image?: string;
  [key: string]: string | undefined;
}

export interface EventCallback {
  (res: { status: number }): void;
}

export type LogLevel = 'info' | 'warn' | 'error';

/** Configuration for SDK programmatic initialization. */
export interface AnalyticsConfig {
  /** Your website/project ID. */
  websiteId: string;
  /** Primary domain being tracked (e.g. "example.com"). */
  domain: string;
  /** Custom API endpoint URL. Defaults to the built-in endpoint. */
  apiUrl?: string;
  /** Enable verbose console logging. */
  debug?: boolean;
  /** Suppress all console output from the tracker. */
  disableConsole?: boolean;
  /** Allow tracking on localhost (disabled by default). */
  allowLocalhost?: boolean;
  allowIframe?: boolean;
  /** Additional hostnames treated as internal (cross-domain tracking). */
  allowedHostnames?: string[];
}
