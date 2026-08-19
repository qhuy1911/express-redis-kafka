import { prisma } from '../config/db.js';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/category.schema.js';
import { AppError } from '../utils/appError.js';

export const create = async (input: CreateCategoryInput) => {
  const { name, slug, description } = input;
  const existingCategory = await prisma.category.findFirst({
    where: { slug, isDeleted: false },
  });

  if (existingCategory) {
    throw new AppError('Category slug already exists', 409);
  }

  return prisma.category.create({
    data: {
      name,
      slug,
      description,
    },
  });
};

export const findAll = async () => {
  return prisma.category.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const findByIdOrSlug = async (identifier: string) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug: identifier }, { id: identifier }],
    },
    include: {
      products: {
        where: {
          isDeleted: false,
          isPublished: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

export const update = async (id: string, input: UpdateCategoryInput) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (input.slug && input.slug !== category.slug) {
    const existingCategory = await prisma.category.findFirst({
      where: { slug: input.slug, isDeleted: false },
    });

    if (existingCategory) {
      throw new AppError('Category slug already exists', 409);
    }
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: input,
  });
};

export const remove = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const productCount = await prisma.product.count({
    where: {
      categoryId: id,
      isDeleted: false,
    },
  });

  if (productCount > 0) {
    throw new AppError('Cannot delete category containing products', 409);
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });
};
