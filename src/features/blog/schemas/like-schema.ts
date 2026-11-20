import { z } from 'zod'

export const togglePostLikeSchema = z.string().trim().min(1)
