import { type SQL, type SQLWrapper, sql } from 'drizzle-orm'
import { type Result, tryCatchResult } from '@/utils/result'

export type DatabaseError = { reason: 'DATABASE_ERROR'; details?: unknown }

export function withDatabaseError<S, E extends { reason: string } = never>(
  context: string,
  fn: () => Promise<Result<S, E>>,
): Promise<Result<S, E | DatabaseError>> {
  return tryCatchResult(fn, (thrown) => {
    console.error(`${context}:`, thrown)
    return { reason: 'DATABASE_ERROR', details: thrown }
  })
}

export function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

export function likeContains(column: SQLWrapper, query: string): SQL {
  return sql`${column} like ${`%${escapeLikePattern(query)}%`} escape '\\'`
}
