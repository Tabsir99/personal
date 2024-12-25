import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.REDIS_KV_REST_API_URL,
  token: process.env.REDIS_KV_REST_API_TOKEN,
});

const sessionLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(6, "1800 s"),
  analytics: true,
});

const authLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
});
export { redis, sessionLimiter, authLimiter };
