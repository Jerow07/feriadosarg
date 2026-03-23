import RedisPackage from 'ioredis';

// Handle both ESM and CJS imports for ioredis
const Redis = (RedisPackage as any).default || RedisPackage;

let redisInstance: any = null;

export function getRedis() {
  if (redisInstance) return redisInstance;

  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL or KV_URL is missing in environment variables');
  }

  // Use the Redis constructor from the package
  redisInstance = new Redis(redisUrl, {
    maxRetriesPerRequest: 0,
    connectTimeout: 10000,
    // Ensure we don't crash on connection errors during init
    lazyConnect: true 
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
