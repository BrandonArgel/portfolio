import { count, eq, sql } from 'drizzle-orm'
import { type AppDatabase, db } from '@/db'
import { posts, users } from '@/db/schema'
import { withDatabaseError } from '@/db/utils'
import { okay, type Result } from '@/utils/result'
import type { DashboardStatsError } from '../types/errors'

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalUsers: number
  totalViews: number
}

export function getDashboardStats(
  isAdmin: boolean,
  database: AppDatabase = db,
): Promise<Result<DashboardStats, DashboardStatsError>> {
  return withDatabaseError('Error fetching dashboard stats', async () => {
    const [totalPostsQuery, publishedPostsQuery, totalUsersQuery, totalViewsQuery] =
      await Promise.all([
        database.select({ value: count() }).from(posts),
        database.select({ value: count() }).from(posts).where(eq(posts.published, true)),
        isAdmin ? database.select({ value: count() }).from(users) : Promise.resolve([{ value: 0 }]),
        database.select({ value: sql<number>`coalesce(sum(${posts.viewsCount}), 0)` }).from(posts),
      ])

    const totalPosts = totalPostsQuery[0]?.value ?? 0
    const publishedPosts = publishedPostsQuery[0]?.value ?? 0
    const draftPosts = totalPosts - publishedPosts
    const totalUsers = totalUsersQuery[0]?.value ?? 0
    const totalViews = Number(totalViewsQuery[0]?.value ?? 0)

    return okay({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      totalViews,
    })
  })
}
