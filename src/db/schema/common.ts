import { sql } from 'drizzle-orm'
import { integer, text } from 'drizzle-orm/sqlite-core'

export const timestamps = {
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
}

export const baseColumns = {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ...timestamps,
}
