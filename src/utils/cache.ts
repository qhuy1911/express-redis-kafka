import { redis } from '../config/redis.js';

export const DEFAULT_TTL = 3600; // 3600 seconds = 1 hour

/**
 * Get or Set Cache (Cache-Aside Helper)
 */
export const getOrSetCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlInSeconds: number = DEFAULT_TTL,
) => {
  try {
    const cachedData = await redis.get(key);

    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
  } catch (error) {
    // If Redis fails, log the error and fall back to the DB (don't crash the app).
    console.error(`[Redis Get Error] Key: ${key}`, error);
  }

  const 
};
