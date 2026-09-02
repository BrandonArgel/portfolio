import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(100, 'Title is too long'),
  slug: z
    .string()
    .min(3, 'Slug is too short')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().min(10, 'Content is too short'),
  published: z.boolean().default(false),
  categoryIds: z.array(z.string()).optional().default([]),
})
