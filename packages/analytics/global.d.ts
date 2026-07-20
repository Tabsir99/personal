/**
 * Global type declarations for the analytics script when loaded via `<script>` tag.
 *
 * Usage:
 * 1. Add a `/// <reference path="global.d.ts" />` directive, or
 * 2. Include this file in your tsconfig `include` array.
 *
 * @example
 * ```html
 * <script
 *   src="https://admin.tabsircg.com/js/cgd.js"
 *   data-website-id="your-id"
 *   data-domain="example.com"
 * ></script>
 * ```
 *
 * ```ts
 * // Now typed globally:
 * window.cgd('signup', { plan: 'pro' });
 * ```
 */

/** Custom event data — flat string key-value pairs, max 10 keys, max 32-char keys, max 255-char values. */
interface CgdEventData {
  [key: string]: string;
}

/** Payment event data. */
interface CgdPaymentData extends CgdEventData {
  email: string;
}

/** Identify event data. */
interface CgdIdentifyData extends CgdEventData {
  user_id: string;
  name?: string;
  image?: string;
}

/**
 * Global analytics handler exposed by the tracking script.
 *
 * @param event - The event name. Reserved names: `"payment"`, `"identify"`.
 * @param data - Optional key-value data attached to the event.
 *
 * @example
 * ```ts
 * // Custom event
 * cgd('signup', { plan: 'pro', source: 'hero' });
 *
 * // Payment tracking
 * cgd('payment', { email: 'user@example.com' });
 *
 * // User identification
 * cgd('identify', { user_id: 'u_123', name: 'Jane' });
 * ```
 */
declare function cgd(event: 'payment', data: CgdPaymentData): void;
declare function cgd(event: 'identify', data: CgdIdentifyData): void;
declare function cgd(event: string, data?: CgdEventData): void;

interface Window {
  /** Global analytics handler. See {@link cgd}. */
  cgd: typeof cgd;
}
