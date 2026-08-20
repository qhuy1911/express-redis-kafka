import { Redis } from 'ioredis';
import { env } from './env.js';

const redisHost = env.REDIS_HOST;
const redisPort = env.REDIS_PORT;
const redisPassword = env.REDIS_PASSWORD;

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('🚀 Redis client connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});
