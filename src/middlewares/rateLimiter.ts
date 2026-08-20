import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/appError.js';

interface RateLimitOptions {
  windowInSeconds: number; // Khoảng thời gian theo dõi (ví dụ: 60s)
  maxRequests: number; // Số request tối đa trong khoảng thời gian trên
  keyPrefix?: string; // Tiền tố phân biệt loại API (ví dụ: 'global', 'auth')
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowInSeconds, maxRequests, keyPrefix = 'rl' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Lấy IP của client (hỗ trợ cả trường hợp đứng sau Reverse Proxy như Nginx)
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.ip ||
      '127.0.0.1';

    const redisKey = `ratelimit:${keyPrefix}:${clientIp}`;

    try {
      // Dùng Redis Pipeline để thực thi 2 lệnh atomic (Atomic Execution)
      const pipeline = redis.pipeline();
      pipeline.incr(redisKey); // Tăng đếm request
      pipeline.ttl(redisKey); // Lấy thời gian sống còn lại của key

      const results = await pipeline.exec();

      if (!results) {
        return next(); // Fallback nếu pipeline lỗi
      }

      const [incrErr, currentCount] = results[0] as [Error | null, number];
      const [ttlErr, currentTtl] = results[1] as [Error | null, number];

      if (incrErr || ttlErr) {
        console.error('[RateLimiter Error]', incrErr || ttlErr);
        return next(); // Fallback nếu Redis có lỗi
      }

      // Lần đầu tiên IP này gọi API -> Set TTL cho key
      if (currentCount === 1 || currentTtl === -1) {
        await redis.expire(redisKey, windowInSeconds);
      }

      const ttl = currentTtl > 0 ? currentTtl : windowInSeconds;
      const resetTime = Math.floor(Date.now() / 1000) + ttl;

      // Đính kèm các RateLimit Headers theo tiêu chuẩn
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, maxRequests - currentCount),
      );
      res.setHeader('X-RateLimit-Reset', resetTime);

      // Nếu số request vượt quá giới hạn -> Chặn lại và bắn lỗi 429
      if (currentCount > maxRequests) {
        res.setHeader('Retry-After', ttl);
        return next(
          new AppError(
            `Too many requests. Please try again in ${ttl} seconds.`,
            429,
          ),
        );
      }

      next();
    } catch (error) {
      console.error('[RateLimiter Catch Error]', error);
      // Giữ cho app không bị sập nếu Redis gặp sự cố
      next();
    }
  };
};
