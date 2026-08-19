import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({}),
});
