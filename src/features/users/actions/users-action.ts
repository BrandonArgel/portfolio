'use server'

import { revalidateLocalizedPaths } from '@/lib/actions/revalidate-localized-paths'
import { runAuthorizedAction } from '@/lib/actions/run-authorized-action'
import type { Result } from '@/utils/result'
import { banUserSchema, unbanUserSchema, updateUserRoleSchema } from '../schemas/user-schema'
import {
  type BanUserInput,
  type BanUserResult,
  banUser,
  type UnbanUserResult,
  type UpdateUserRoleInput,
  type UpdateUserRoleResult,
  unbanUser,
  updateUserRole,
} from '../services/users-service'
import type { UserError } from '../types/errors'

function revalidateUserPaths() {
  revalidateLocalizedPaths(['/dashboard/users', '/dashboard'])
}

export async function updateUserRoleAction(
  input: UpdateUserRoleInput,
): Promise<Result<UpdateUserRoleResult, UserError>> {
  return runAuthorizedAction({
    role: 'admin',
    schema: updateUserRoleSchema,
    input,
    handler: (data, actor) => updateUserRole(data, actor.id),
    onSuccess: revalidateUserPaths,
  })
}

export async function banUserAction(
  input: BanUserInput,
): Promise<Result<BanUserResult, UserError>> {
  return runAuthorizedAction({
    role: 'admin',
    schema: banUserSchema,
    input,
    handler: (data, actor) => banUser(data, actor.id),
    onSuccess: revalidateUserPaths,
  })
}

export async function unbanUserAction(input: {
  userId: string
}): Promise<Result<UnbanUserResult, UserError>> {
  return runAuthorizedAction({
    role: 'admin',
    schema: unbanUserSchema,
    input,
    handler: (data) => unbanUser(data.userId),
    onSuccess: revalidateUserPaths,
  })
}
