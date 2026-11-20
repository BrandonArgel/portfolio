import type { z } from 'zod'
import {
  type RequiredRole,
  type VerifiedActor,
  type VerifyAccessError,
  verifyAccess,
} from '@/lib/auth/verify-access'
import { error, isErrorResult, type Result } from '@/utils/result'

export type ValidationError = { reason: 'VALIDATION_ERROR' }

type VerifyAccessFn = (
  requiredRole: RequiredRole,
) => Promise<Result<VerifiedActor, VerifyAccessError>>

interface DefaultValidationOptions<
  TOutput,
  TServiceError extends { reason: string },
  TSchema extends z.ZodType,
> {
  role: RequiredRole
  schema: TSchema
  input: unknown
  mapValidationError?: undefined
  handler: (data: z.infer<TSchema>, actor: VerifiedActor) => Promise<Result<TOutput, TServiceError>>
  onSuccess?: (result: TOutput, data: z.infer<TSchema>) => void | Promise<void>
  verifyAccessFn?: VerifyAccessFn
}

interface CustomValidationOptions<
  TOutput,
  TServiceError extends { reason: string },
  TSchema extends z.ZodType,
  TValidationError extends { reason: string },
> {
  role: RequiredRole
  schema: TSchema
  input: unknown
  mapValidationError: (zodError: z.ZodError) => TValidationError
  handler: (data: z.infer<TSchema>, actor: VerifiedActor) => Promise<Result<TOutput, TServiceError>>
  onSuccess?: (result: TOutput, data: z.infer<TSchema>) => void | Promise<void>
  verifyAccessFn?: VerifyAccessFn
}

interface WithoutSchemaOptions<TOutput, TServiceError extends { reason: string }> {
  role: RequiredRole
  handler: (actor: VerifiedActor) => Promise<Result<TOutput, TServiceError>>
  onSuccess?: (result: TOutput) => void | Promise<void>
  verifyAccessFn?: VerifyAccessFn
}

export function runAuthorizedAction<
  TOutput,
  TServiceError extends { reason: string },
  TSchema extends z.ZodType,
>(
  options: DefaultValidationOptions<TOutput, TServiceError, TSchema>,
): Promise<Result<TOutput, VerifyAccessError | ValidationError | TServiceError>>

export function runAuthorizedAction<
  TOutput,
  TServiceError extends { reason: string },
  TSchema extends z.ZodType,
  TValidationError extends { reason: string },
>(
  options: CustomValidationOptions<TOutput, TServiceError, TSchema, TValidationError>,
): Promise<Result<TOutput, VerifyAccessError | TValidationError | TServiceError>>

export function runAuthorizedAction<TOutput, TServiceError extends { reason: string }>(
  options: WithoutSchemaOptions<TOutput, TServiceError>,
): Promise<Result<TOutput, VerifyAccessError | TServiceError>>

export async function runAuthorizedAction<
  TOutput,
  TServiceError extends { reason: string },
  TSchema extends z.ZodType = never,
  TValidationError extends { reason: string } = ValidationError,
>(
  options:
    | DefaultValidationOptions<TOutput, TServiceError, TSchema>
    | CustomValidationOptions<TOutput, TServiceError, TSchema, TValidationError>
    | WithoutSchemaOptions<TOutput, TServiceError>,
): Promise<
  Result<TOutput, VerifyAccessError | ValidationError | TValidationError | TServiceError>
> {
  const checkAccess = options.verifyAccessFn ?? verifyAccess
  const [authErr, actor] = await checkAccess(options.role)
  if (authErr) return error(authErr)

  if ('schema' in options) {
    const parsed = options.schema.safeParse(options.input)
    if (!parsed.success) {
      return error(
        options.mapValidationError
          ? options.mapValidationError(parsed.error)
          : { reason: 'VALIDATION_ERROR' },
      )
    }

    const outcome = await options.handler(parsed.data, actor)
    if (isErrorResult(outcome)) return outcome

    if (options.onSuccess) {
      await options.onSuccess(outcome[1], parsed.data)
    }

    return outcome
  }

  const outcome = await options.handler(actor)
  if (isErrorResult(outcome)) return outcome

  if (options.onSuccess) {
    await options.onSuccess(outcome[1])
  }

  return outcome
}
