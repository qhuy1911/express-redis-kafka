import { prisma } from '../config/db.js';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/category.schema.js';
import { AppError } from '../utils/appError.js';
import { getOrSetCache, invalidateCache } from '../utils/cache.js';

const CACHE_KEYS = {
  ALL_CATEGORIES: 'categories:all',
  CATEGORY_DETAIL: (idOrSlug: string) => `categories:detail:${idOrSlug}`,
};

// 1. READ ALL CATEGORIES (Cache-Aside)
export const findAll = async () => {
  return getOrSetCache(CACHE_KEYS.ALL_CATEGORIES, async () => {
    return prisma.category.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
    });
  });
};

// 2. READ CATEGORY BY ID OR SLUG (Cache-Aside)
export const findByIdOrSlug = async (identifier: string) => {
  return getOrSetCache(CACHE_KEYS.CATEGORY_DETAIL(identifier), async () => {
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
  });
};

// 3. CREATE CATEGORY (Invalidate Cache)
export const create = async (input: CreateCategoryInput) => {
  const { name, slug, description } = input;
  const existingCategory = await prisma.category.findFirst({
    where: { slug, isDeleted: false },
  });

  if (existingCategory) {
    throw new AppError('Category slug already exists', 409);
  }

  const newCategory = await prisma.category.create({
    data: {
      name,
      slug,
      description,
    },
  });

  // Invalidate cache all categories
  await invalidateCache(CACHE_KEYS.ALL_CATEGORIES);

  return newCategory;
};

// 4. UPDATE CATEGORY (Invalidate Cache)
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

  const updatedCategory = await prisma.category.update({
    where: {
      id,
    },
    data: input,
  });

  // Invalidate cache all categories and detail category
  await invalidateCache('categories:*');

  return updatedCategory;
};

// 5. DELETE CATEGORY (Invalidate Cache)
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

  await prisma.category.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  // Invalidate cache all categories and detail category
  await invalidateCache('categories:*');
};
