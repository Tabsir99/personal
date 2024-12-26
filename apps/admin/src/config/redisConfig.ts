import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;
const getRedis = () => {
  if (redis) {
    return redis;
  }
  redis = new Redis({
    url: process.env.REDIS_KV_REST_API_URL,
    token: process.env.REDIS_KV_REST_API_TOKEN,
  });
  return redis;
};

const sessionLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(6, "1800 s"),
  analytics: true,
});

const authLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
});
export { getRedis, sessionLimiter, authLimiter };
