import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
    password: z
      .string('Password is required')
      .min(6, 'Password must be at least 6 characters long'),
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
    password: z.string('Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
