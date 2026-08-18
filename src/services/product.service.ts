import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from '../schemas/product.schema.js';

export const create = async (input: CreateProductInput) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      slug: input.slug,
    },
  });

  if (existingProduct) {
    throw new AppError('Product slug already exists', 409);
  }

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      images: input.images,
      isPublished: input.isPublished,
    },
  });

  return product;
};

export const findAll = async (query: GetProductsQuery) => {
  const { page, limit } = query;

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.product.count(),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findOne = async (identifier: string) => {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

export const update = async (id: string, input: UpdateProductInput) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  if (input.slug && input.slug !== existingProduct.slug) {
    const slugExists = await prisma.product.findUnique({
      where: {
        slug: input.slug,
      },
    });

    if (slugExists) {
      throw new AppError('Product slug already exists', 409);
    }
  }

  return prisma.product.update({
    where: { id },
    data: input,
  });
};

export const remove = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({
    where: { id },
  });
};
