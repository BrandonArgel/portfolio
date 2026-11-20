import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema/index'

if (typeof window !== 'undefined') {
  throw new Error('src/db/index.ts cannot be imported in a client bundle.')
}

const isTest = process.env.NODE_ENV === 'test'

if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME && !isTest) {
  dotenv.config({ path: '.env.local' })
}

const client = createClient({
  url: isTest ? ':memory:' : (process.env.DATABASE_URL as string),
  authToken: isTest ? undefined : process.env.DATABASE_AUTH_TOKEN || undefined,
})

export const db = drizzle(client, { schema })
export type AppDatabase = typeof db
