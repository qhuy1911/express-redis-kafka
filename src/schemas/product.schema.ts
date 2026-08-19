import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Product name is required')
      .max(200, 'Product name must not exceed 200 characters'),

    slug: z
      .string()
      .trim()
      .min(1, 'Product slug is required')
      .max(200, 'Product slug must not exceed 200 characters'),

    description: z.string().trim().optional(),

    price: z.number().positive('Price must be greater than 0'),

    stock: z
      .number()
      .int('Stock must be an integer')
      .nonnegative('Stock cannot be negative'),

    images: z.array(z.string().url()).default([]),

    isPublished: z.boolean().default(false),

    categoryId: z.string().uuid(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),

  body: z
    .object({
      name: z.string().trim().min(1).max(200).optional(),

      slug: z.string().trim().min(1).max(200).optional(),

      description: z.string().trim().optional(),

      price: z.number().positive().optional(),

      stock: z.number().int().nonnegative().optional(),

      images: z.array(z.string().url()).optional(),

      isPublished: z.boolean().optional(),

      categoryId: z.string().uuid().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
});

export const getProductsQuerySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),

      limit: z.coerce.number().int().positive().max(100).default(20),
    })
    .passthrough(),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID or slug is required'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];

export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];

export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>['query'];
