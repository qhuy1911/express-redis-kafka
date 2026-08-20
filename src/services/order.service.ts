import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { invalidateCache } from '../utils/cache.js';
import { withLock } from '../utils/lock.js';
import { addOrderEmailJob } from '../queues/order.queue.js';

export const createOrder = async (userId: string) => {
  // 1. Lấy giỏ hàng trước để lấy danh sách variantId cần lock
  const userCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        select: {
          variantId: true,
        },
      },
    },
  });

  if (!userCart || userCart.items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  // 2. Sắp xếp danh sách variantId để chống Deadlock giữa các request đồng thời
  const sortedVariantIds = Array.from(
    new Set(userCart.items.map((item) => item.variantId)),
  ).sort();

  const lockKeys = sortedVariantIds.map((id) => `locks:variant:${id}`);

  // 3. Bọc toàn bộ Transaction đặt hàng trong Redis Redlock
  const result = await withLock(lockKeys, 5000, async () => {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId,
        },
        include: {
          items: {
            include: {
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError('Your cart is empty', 400);
      }

      let totalAmount = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const variant = item.variant;

        if (variant.stock < item.quantity) {
          throw new AppError(`Not enough stock for SKU ${variant.sku}`, 400);
        }

        const price = Number(variant.price);
        const subtotal = price * item.quantity;

        totalAmount += subtotal;

        orderItems.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: variant.price,
          subtotal,
        });
      }

      // Sau khi order được tạo thành công trong DB:
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Trừ kho nguyên tử (Atomic Decrement)
      for (const item of cart.items) {
        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count !== 1) {
          throw new AppError(
            `Not enough stock for SKU ${item.variant.sku}`,
            400,
          );
        }
      }

      // Xóa item trong giỏ hàng sau khi đặt thành công
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      // Đẩy Job gửi Email ngầm vào BullMQ (Không await để trả về response API ngay lập tức)
      addOrderEmailJob({
        orderId: order.id,
        userEmail: userCart.user.email,
        totalAmount: Number(order.totalAmount),
      }).catch((err) => console.error('Failed to add order email job:', err));

      return order;
    });
  });

  // 4. Invalidate Cache Sản phẩm sau khi trừ kho thành công
  await invalidateCache('product_variants:*');
  await invalidateCache('products:*');

  return result;
};
