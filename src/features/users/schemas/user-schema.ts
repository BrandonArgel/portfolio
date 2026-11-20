import { z } from 'zod'

export const updateUserRoleSchema = z.object({
  userId: z.string().trim().min(1),
  newRole: z.enum(['admin', 'editor', 'user']),
})

export const banUserSchema = z.object({
  userId: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  durationInDays: z.union([z.number().positive(), z.literal('permanent')]),
})

export const unbanUserSchema = z.object({
  userId: z.string().trim().min(1),
})
