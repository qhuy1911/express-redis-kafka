import { AppError } from './appError.js';
import { redlock } from '../config/redlock.js';

/**
 * Thực thi một tác vụ trong môi trường Distributed Lock
 * @param resourceKeys Danh sách các resource key cần lock (vd: ['lock:product:123'])
 * @param ttl Time-to-live của lock tính bằng milisec (mặc định 5000ms = 5s)
 * @param callback Hàm chứa logic nghiệp vụ cần bảo vệ
 */
export const withLock = async <T>(
  resourceKeys: string[],
  ttl: number = 5000,
  callback: () => Promise<T>,
): Promise<T> => {
  let lock;
  try {
    // 1. Xin cấp Lock
    lock = await redlock.acquire(resourceKeys, ttl);

    // 2. Thực thi logic nghiệp vụ (ví dụ: tạo đơn hàng, trừ kho)
    return await callback();
  } catch (error: any) {
    // Trường hợp không lấy được lock do hết retryCount
    if (error.name === 'ExecutionError') {
      throw new AppError(
        'Hệ thống đang xử lý nhiều lượt đặt hàng cho sản phẩm này, vui lòng thử lại sau giây lát.',
        429,
      );
    }
    throw error;
  } finally {
    // 3. Giải phóng Lock trong mọi trường hợp (Kể cả khi callback throw exception)
    if (lock) {
      await lock.release().catch((err: any) => {
        console.error('Failed to release lock:', err);
      });
    }
  }
};
