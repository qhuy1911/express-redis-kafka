import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must contain only lowercase letters, numbers, and hyphens',
      ),

    description: z.string().trim().max(500).optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),

  body: z
    .object({
      name: z.string().trim().min(1).max(100).optional(),

      slug: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'Slug must contain only lowercase letters, numbers, and hyphens',
        )
        .optional(),

      description: z.string().trim().max(500).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
