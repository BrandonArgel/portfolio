import { z } from 'zod'
import { LOCALES } from '@/i18n/routing'

export const BlogFrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  coverImage: z.url('Must be a valid URL').optional().or(z.literal('')),
  locale: z.enum(LOCALES).default('en'),
  translationGroupId: z.uuid('Must be a valid UUID').optional().or(z.literal('')),
  published: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
})

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>

export const defaultFrontmatter: BlogFrontmatter = {
  title: '',
  slug: '',
  description: '',
  coverImage: '',
  locale: 'en',
  translationGroupId: '',
  published: false,
  categories: [],
}
