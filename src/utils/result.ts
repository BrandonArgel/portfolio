export type Result<S, E extends { reason: string }> = [E, null] | [null, S]

export function okay<S>(data: S): Result<S, never> {
  return [null, data]
}

export function error<const R extends string, E extends { reason: R }>(error: E): Result<never, E> {
  return [error, null]
}

export function isErrorResult<S, E extends { reason: string }>(
  result: Result<S, E>,
): result is [E, null] {
  return result[0] !== null
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`)
}

export async function tryCatchResult<S, E extends { reason: string }, C extends { reason: string }>(
  fn: () => Promise<Result<S, E>>,
  onThrow: (thrown: unknown) => C,
): Promise<Result<S, E | C>> {
  try {
    return await fn()
  } catch (thrown) {
    return error(onThrow(thrown))
  }
}

export async function fromPromise<S, E extends { reason: string }>(
  fn: () => Promise<S>,
  onThrow: (thrown: unknown) => E,
): Promise<Result<S, E>> {
  try {
    return okay(await fn())
  } catch (thrown) {
    return error(onThrow(thrown))
  }
}
