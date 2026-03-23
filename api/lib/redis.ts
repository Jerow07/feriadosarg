import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export function getRedis() {
  if (redisInstance) return redisInstance;

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL or KV_URL is missing in environment variables');
  }

  redisInstance = new Redis(redisUrl, {
    maxRetriesPerRequest: 0,
    connectTimeout: 10000,
  });

  return redisInstance;
}

export const redis = {
  set: (key: string, value: string) => getRedis().set(key, value),
  get: (key: string) => getRedis().get(key),
  del: (key: string) => getRedis().del(key),
  scan: (cursor: string, ...args: any[]) => getRedis().scan(cursor, ...args),
  mget: (...keys: string[]) => getRedis().mget(...keys),
};
