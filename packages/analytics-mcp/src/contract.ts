import { z } from "zod";

export const CUSTOM_EVENT_TYPE = "custom";
export const RESERVED_EVENT_TYPES = ["pageview", "payment", "identify"] as const;
export const EVENT_TYPE_MAX_LENGTH = 64;
export const VISITOR_ID_MAX_LENGTH = 100;
export const HREF_MAX_LENGTH = 2000;

export const EXTRA_DATA_MAX_PROPERTIES = 10;
export const EXTRA_DATA_MAX_KEY_LENGTH = 32;
export const EXTRA_DATA_MAX_VALUE_LENGTH = 1000;
export const EXTRA_DATA_MAX_BYTES = 4000;
export const EXTRA_DATA_KEY_PATTERN = /^[a-z0-9_-]+$/;
export const EVENT_NAME_KEY = "eventName";

export const extraDataSchema = z
  .record(z.string(), z.string().max(EXTRA_DATA_MAX_VALUE_LENGTH))
  .refine(
    (data) => Object.keys(data).filter((key) => key !== EVENT_NAME_KEY).length <= EXTRA_DATA_MAX_PROPERTIES,
    { message: `At most ${EXTRA_DATA_MAX_PROPERTIES} properties are allowed` },
  )
  .refine(
    (data) =>
      Object.keys(data).every(
        (key) =>
          key === EVENT_NAME_KEY ||
          (key.length > 0 && key.length <= EXTRA_DATA_MAX_KEY_LENGTH && EXTRA_DATA_KEY_PATTERN.test(key)),
      ),
    {
      message: `Property names must match ${EXTRA_DATA_KEY_PATTERN.source} and be at most ${EXTRA_DATA_MAX_KEY_LENGTH} characters`,
    },
  )
  .refine((data) => JSON.stringify(data).length <= EXTRA_DATA_MAX_BYTES, {
    message: `Serialised properties must not exceed ${EXTRA_DATA_MAX_BYTES} characters`,
  });
