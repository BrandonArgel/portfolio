import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { serverEnv } from '@/data/serverEnv'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
    authToken: serverEnv.DATABASE_AUTH_TOKEN,
  },
  strict: true,
})
