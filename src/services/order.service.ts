import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import { invalidateCache } from '../utils/cache.js';

export const createOrder = async (userId: string) => {
  const result = await prisma.$transaction(async (tx) => {
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

    for (const item of cart.items) {
      const result = await tx.productVariant.updateMany({
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

      if (result.count !== 1) {
        throw new AppError(`Not enough stock for SKU ${item.variant.sku}`, 400);
      }
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });

  await invalidateCache('product_variants:*');
  await invalidateCache('products:*');

  return result;
};
