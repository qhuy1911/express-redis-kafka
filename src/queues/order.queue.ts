import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export interface OrderEmailJobData {
  orderId: string;
  userEmail: string;
  totalAmount: number;
}

export const ORDER_QUEUE_NAME = 'order-queue';

// Khởi tạo Queue kết nối chung Redis Connection hiện có
export const orderQueue = new Queue<OrderEmailJobData>(ORDER_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // Thử lại tối đa 3 lần nếu lỗi
    backoff: {
      type: 'exponential',
      delay: 5000, // Chờ 5s, 10s, 20s giữa các lần thử lại
    },
    removeOnComplete: {
      count: 100, // Giữ lại 100 job gần nhất
      age: 24 * 3600, // Hoặc giữ lại trong vòng 24 giờ
    },
    removeOnFail: 100, // Giữ lại 100 job lỗi để debug
  },
});

// Hàm Producer đẩy Job vào Queue
export const addOrderEmailJob = async (data: OrderEmailJobData) => {
  await orderQueue.add('send-order-confirmation-email', data);
};
