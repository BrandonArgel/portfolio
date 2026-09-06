'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { session, user } from '@/db/schema'
import { ActionError, adminActionClient } from '@/lib/safe-action'

const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newRole: z.enum(['admin', 'editor', 'user']),
})

export const updateUserRoleAction = adminActionClient
  .inputSchema(updateUserRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, newRole } = parsedInput

    try {
      // Find the target user in the database
      const targetUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      })

      if (!targetUser) {
        throw new ActionError(
          'User Not Found',
          'The specified user could not be found in the database.',
        )
      }

      // Safeguard: Prevent admin from revoking their own admin privileges to avoid lockout
      if (ctx.user.id === userId && newRole !== 'admin') {
        throw new ActionError(
          'Action Not Allowed',
          'You cannot revoke your own administrator privileges.',
        )
      }

      // Update user role in Drizzle database
      await db
        .update(user)
        .set({
          role: newRole,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))

      // Revalidate user management dashboard
      revalidatePath('/dashboard/users')
      revalidatePath('/dashboard')

      return {
        success: true,
        userId,
        newRole,
        message: 'User role updated successfully.',
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to update role',
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while updating the role.',
      )
    }
  })

const banUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().min(1, 'Reason is required'),
  durationInDays: z.union([z.number().positive(), z.literal('permanent')]),
})

export const banUserAction = adminActionClient
  .inputSchema(banUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, reason, durationInDays } = parsedInput

    try {
      // Safeguard: Prevent admin from banning themselves
      if (ctx.user.id === userId) {
        throw new ActionError('Action Not Allowed', 'You cannot ban your own account.')
      }

      const targetUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      })

      if (!targetUser) {
        throw new ActionError(
          'User Not Found',
          'The specified user could not be found in the database.',
        )
      }

      const banExpires =
        durationInDays === 'permanent'
          ? null
          : new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1000)

      // Update user status to banned
      await db
        .update(user)
        .set({
          banned: true,
          banReason: reason.trim(),
          banExpires,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))

      // Terminate all active sessions for the banned user immediately
      await db.delete(session).where(eq(session.userId, userId))

      revalidatePath('/dashboard/users')
      revalidatePath('/dashboard')

      return {
        success: true,
        userId,
        banned: true,
        message: 'User has been banned successfully.',
      }
    } catch (error) {
      console.error('Error banning user:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to ban user',
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while banning the user.',
      )
    }
  })

const unbanUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export const unbanUserAction = adminActionClient
  .inputSchema(unbanUserSchema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput

    try {
      const targetUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      })

      if (!targetUser) {
        throw new ActionError(
          'User Not Found',
          'The specified user could not be found in the database.',
        )
      }

      // Restore user status to active
      await db
        .update(user)
        .set({
          banned: false,
          banReason: null,
          banExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))

      revalidatePath('/dashboard/users')
      revalidatePath('/dashboard')

      return {
        success: true,
        userId,
        banned: false,
        message: 'User has been unbanned successfully.',
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
      if (error instanceof ActionError) throw error
      throw new ActionError(
        'Failed to unban user',
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while unbanning the user.',
      )
    }
  })
