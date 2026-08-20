import Redlock from 'redlock';
import { redis } from './redis.js';

export const redlock = new Redlock(
  [redis], // Truyền danh sách Redis client (hoặc nhiều Redis nodes nếu chạy Cluster)
  {
    // Số lần thử lại nếu chưa lấy được khóa
    retryCount: 10,

    // Khoảng thời gian chờ giữa các lần thử lại (ms)
    retryDelay: 200, // 200ms

    // Thời gian ngẫu nhiên cộng thêm vào retryDelay để tránh hiện tượng Herd Effect (Thundering Herd)
    retryJitter: 100, // 100ms
  },
);

redlock.on('error', (error: unknown) => {
  if (error instanceof Error) {
    console.error('Redlock Error:', error.message);
  } else {
    console.error('Redlock Unknown Error:', error);
  }
});
