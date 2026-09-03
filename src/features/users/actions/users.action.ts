'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db'
import { user } from '@/db/schema'
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
