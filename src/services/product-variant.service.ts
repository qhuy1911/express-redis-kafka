import { Prisma } from '../generated/prisma/client.js';

import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';

interface CreateVariantInput {
  productId: string;
  sku: string;
  price: number;
  stock?: number;
  attributes: Record<string, string>;
}

interface UpdateVariantInput {
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, string>;
}

export const createVariant = async (input: CreateVariantInput) => {
  const { productId, sku, price, stock = 0, attributes } = input;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isDeleted: false,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const existingVariant = await prisma.productVariant.findUnique({
    where: {
      sku,
    },
  });

  if (existingVariant) {
    throw new AppError('SKU is already registered', 409);
  }

  return prisma.productVariant.create({
    data: {
      productId,
      sku,
      price: new Prisma.Decimal(price),
      stock,
      attributes,
    },
  });
};

export const getProductVariants = async (productId: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isDeleted: false,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return prisma.productVariant.findMany({
    where: {
      productId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getVariantById = async (id: string) => {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isDeleted: true,
        },
      },
    },
  });

  if (!variant) {
    throw new AppError('Product variant not found', 404);
  }

  if (!variant || variant.product.isDeleted) {
    throw new AppError('Product variant not found', 404);
  }

  return variant;
};

export const updateVariant = async (id: string, input: UpdateVariantInput) => {
  const existingVariant = await prisma.productVariant.findUnique({
    where: {
      id,
    },
  });

  if (!existingVariant) {
    throw new AppError('Product variant not found', 404);
  }

  if (input.sku && input.sku !== existingVariant.sku) {
    const skuExists = await prisma.productVariant.findUnique({
      where: {
        sku: input.sku,
      },
    });

    if (skuExists) {
      throw new AppError('SKU is already registered', 409);
    }
  }

  return prisma.productVariant.update({
    where: {
      id,
    },
    data: {
      ...(input.sku !== undefined && {
        sku: input.sku,
      }),

      ...(input.price !== undefined && {
        price: new Prisma.Decimal(input.price),
      }),

      ...(input.stock !== undefined && {
        stock: input.stock,
      }),

      ...(input.attributes !== undefined && {
        attributes: input.attributes,
      }),
    },
  });
};

export const deleteVariant = async (id: string) => {
  const variant = await prisma.productVariant.findUnique({
    where: {
      id,
    },
  });

  if (!variant) {
    throw new AppError('Product variant not found', 404);
  }

  await prisma.productVariant.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
};
