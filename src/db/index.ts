import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema/index'

const isTest = process.env.NODE_ENV === 'test'

if (!isTest) {
  dotenv.config({ path: '.env.local' })
}

const client = createClient({
  url: isTest ? ':memory:' : (process.env.DATABASE_URL as string),
  authToken: isTest ? undefined : process.env.DATABASE_AUTH_TOKEN || undefined,
})

export const db = drizzle(client, { schema })
export type AppDatabase = typeof db
