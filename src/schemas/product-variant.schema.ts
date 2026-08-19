import { z } from 'zod';

const attributesSchema = z
  .record(z.string(), z.string())
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Attributes must not be empty',
  });

export const createProductVariantSchema = z.object({
  body: z.object({
    sku: z
      .string()
      .trim()
      .min(1, 'SKU is required')
      .max(100, 'SKU must not exceed 100 characters'),

    price: z.coerce.number().positive('Price must be greater than 0'),

    stock: z.coerce
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .default(0),

    attributes: attributesSchema,
  }),

  params: z.object({
    productId: z.string().uuid('Invalid product ID'),
  }),
});

export const updateProductVariantSchema = z.object({
  body: z.object({
    sku: z.string().trim().min(1).max(100).optional(),

    price: z.coerce
      .number()
      .positive('Price must be greater than 0')
      .optional(),

    stock: z.coerce
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .optional(),

    attributes: attributesSchema.optional(),
  }),

  params: z.object({
    id: z.string().uuid('Invalid variant ID'),
  }),
});

export const getProductVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid variant ID'),
  }),
});
