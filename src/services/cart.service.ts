import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';

const getOrCreateCart = async (userId: string) => {
  return prisma.cart.upsert({
    where: {
      userId,
    },
    create: {
      userId,
    },
    update: {},
  });
};

export const getCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
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

  if (!cart) {
    return {
      id: null,
      items: [],
      totalAmount: 0,
    };
  }

  const totalAmount = cart.items.reduce((total, item) => {
    return total + Number(item.variant.price) * item.quantity;
  }, 0);

  return {
    ...cart,
    totalAmount,
  };
};

export const addItem = async (
  userId: string,
  variantId: string,
  quantity: number,
) => {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
  });

  if (!variant) {
    throw new AppError('Product variant not found', 404);
  }

  if (variant.stock < quantity) {
    throw new AppError('Not enough stock', 400);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
  });

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (newQuantity > variant.stock) {
    throw new AppError('Not enough stock', 400);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
      },
    });
  }

  return getCart(userId);
};

export const updateItem = async (
  userId: string,
  variantId: string,
  quantity: number,
) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
    include: {
      variant: true,
    },
  });

  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  if (quantity > item.variant.stock) {
    throw new AppError('Not enough stock', 400);
  }

  await prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,
    },
  });

  return getCart(userId);
};

export const removeItem = async (userId: string, variantId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
  });

  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });

  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });
};
