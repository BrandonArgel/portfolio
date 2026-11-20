import { z } from 'zod'

export const recordPostViewSchema = z.string().trim().min(1)
