import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    variantId: z.string().uuid(),
    quantity: z.coerce.number().int().min(1),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1),
  }),
  query: z.object({}),
  params: z.object({
    variantId: z.string().uuid(),
  }),
});

export const cartVariantParamSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    variantId: z.string().uuid(),
  }),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
export type CartVariantParam = z.infer<typeof cartVariantParamSchema>['params'];
