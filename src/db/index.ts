import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { serverEnv } from '@/data/serverEnv'
import * as schema from './schema'

const client = createClient({
  url: serverEnv.DATABASE_URL,
  authToken: serverEnv.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })
