import { Prisma, Product } from '../generated/prisma/client.js';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/appError.js';
import {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from '../schemas/product.schema.js';

const formatProduct = (product: Product) => ({
  ...product,
  price: Number(product.price),
});

export const create = async (input: CreateProductInput) => {
  const existingProduct = await prisma.product.findFirst({
    where: {
      slug: input.slug,
      isDeleted: false,
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

  return formatProduct(product);
};

export const findAll = async (
  query: GetProductsQuery,
  filter: Prisma.ProductWhereInput = {},
  options: { includeDeleted?: boolean } = {},
) => {
  const { page, limit } = query;

  const skip = (page - 1) * limit;

  const finalFilter: Prisma.ProductWhereInput = {
    ...filter,
  };

  if (!options.includeDeleted) {
    finalFilter.isDeleted = false;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: finalFilter,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.product.count({ where: finalFilter }),
  ]);

  return {
    products: products.map(formatProduct),
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
      isDeleted: false,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return formatProduct(product);
};

export const update = async (id: string, input: UpdateProductInput) => {
  const existingProduct = await prisma.product.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  if (input.slug && input.slug !== existingProduct.slug) {
    const slugExists = await prisma.product.findFirst({
      where: {
        slug: input.slug,
        isDeleted: false,
      },
    });

    if (slugExists) {
      throw new AppError('Product slug already exists', 409);
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: input,
  });

  return formatProduct(updatedProduct);
};

export const remove = async (id: string) => {
  const existingProduct = await prisma.product.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.update({
    where: { id },
    data: {
      isDeleted: true,
      slug: `${existingProduct.slug}-deleted-${Date.now()}`,
    },
  });
};
