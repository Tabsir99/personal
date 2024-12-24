import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL as string;
let redis: Redis;

const getRedisClient = () => {
  if (redis) {
    return redis;
  }
  redis = new Redis(redisUrl);
  return redis;
};

export { getRedisClient };
