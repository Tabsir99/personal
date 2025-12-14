import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env.server";

let redis: Redis | undefined;
const getRedis = () => {
  if (redis) {
    return redis;
  }
  redis = new Redis({
    url: env.REDIS_KV_REST_API_URL,
    token: env.REDIS_KV_REST_API_TOKEN,
  });
  return redis;
};

const authLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(3, "1 d"),
});
export { getRedis, authLimiter };
