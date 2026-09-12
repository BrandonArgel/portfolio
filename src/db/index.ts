import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

dotenv.config({ path: '.env.local', override: true })

const client = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
})

export const db = drizzle(client, { schema })
