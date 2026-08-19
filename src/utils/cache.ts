import { redis } from '../config/redis.js';

export const DEFAULT_TTL = 3600; // 1 hour

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

  // Cache miss or Redis fails, fetch fresh data from DB and cache it.
  const freshData = await fetchFn();

  if (freshData !== null && freshData !== undefined) {
    try {
      await redis.set(key, JSON.stringify(freshData), 'EX', ttlInSeconds);
    } catch (error) {
      // If Redis set fails, log the error but still return the fresh data.
      console.error(`[Redis Set Error] Key: ${key}`, error);
    }
  }

  return freshData;
};

/**
 * Remove cache by key pattern
 */
export const invalidateCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`[Redis Invalidate Error] Pattern: ${pattern}`, error);
  }
};
