import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import path from 'path'

dotenv.config({ path: '.env.local' })

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) throw new Error('❌ DATABASE_URL missing')

  console.log('⏳ Starting database migrations...')
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  })
  const db = drizzle(client)

  try {
    const migrationsPath = path.resolve('src/db/migrations')
    await migrate(db, { migrationsFolder: migrationsPath })
    console.log('✅ Database migrations applied successfully!')
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    client.close()
    process.exit(0)
  }
}

runMigrate()
