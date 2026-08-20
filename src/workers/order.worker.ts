import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { ORDER_QUEUE_NAME, OrderEmailJobData } from '../queues/order.queue.js';
import { transporter } from '../utils/mailer.js';
import { env } from '../config/env.js';

export const initOrderWorker = () => {
  console.log('init order worker');
  const worker = new Worker<OrderEmailJobData>(
    ORDER_QUEUE_NAME,
    async (job: Job<OrderEmailJobData>) => {
      const { orderId, userEmail, totalAmount } = job.data;

      console.log(
        `[Worker] Processing order confirmation email for Order #${orderId}...`,
      );

      // Gửi Email xác nhận
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: userEmail,
        subject: `Xác nhận đơn hàng #${orderId}`,
        html: `
          <h2>Cảm ơn bạn đã đặt hàng!</h2>
          <p>Mã đơn hàng: <strong>${orderId}</strong></p>
          <p>Tổng tiền: <strong>${totalAmount.toLocaleString()} VNĐ</strong></p>
        `,
      });

      console.log(
        `[Worker] Sent confirmation email for Order #${orderId} successfully.`,
      );
    },
    { connection: redis },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker Error] Job ${job?.id} failed with error:`, err);
  });

  return worker;
};
