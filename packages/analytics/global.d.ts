/** Global types for the `<script>` tag build. Reference this file or add it to
 * your tsconfig `include` to type `window.cgd`. */

/** Flat string pairs: max 10 keys, 32-char keys, 255-char values. */
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

/** Global handler exposed by the tracking script. `payment` and `identify` are
 * reserved event names. */
declare function cgd(event: 'payment', data: CgdPaymentData): void;
declare function cgd(event: 'identify', data: CgdIdentifyData): void;
declare function cgd(event: string, data?: CgdEventData): void;

interface Window {
  /** Global analytics handler. See {@link cgd}. */
  cgd: typeof cgd;
}
