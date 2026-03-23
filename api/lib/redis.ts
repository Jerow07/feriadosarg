import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

if (!redisUrl) {
  console.error('REDIS_URL or KV_URL is missing');
}

export const redis = new Redis(redisUrl!, {
  // Opts for serverless
  maxRetriesPerRequest: 0,
  connectTimeout: 10000,
});
