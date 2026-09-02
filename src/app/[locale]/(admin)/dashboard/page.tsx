import { count, eq } from 'drizzle-orm'
import { FileText, PlusCircle, ShieldCheck, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/db'
import { posts, user } from '@/db/schema'
import { Link } from '@/i18n/navigation'
import { auth } from '@/lib/auth/auth'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return {
    title: `${t('title')} | Brandon Argel`,
  }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const t = await getTranslations({ locale, namespace: 'dashboard' })
  const isAdmin = session?.user.role === 'admin'

  // Fetch quick metrics
  const [totalPostsResult] = await db.select({ value: count() }).from(posts)
  const [publishedPostsResult] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.published, true))
  const [totalUsersResult] = isAdmin
    ? await db.select({ value: count() }).from(user)
    : [{ value: 0 }]

  const totalPosts = totalPostsResult?.value ?? 0
  const publishedPosts = publishedPostsResult?.value ?? 0
  const draftPosts = totalPosts - publishedPosts
  const totalUsers = totalUsersResult?.value ?? 0

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('overview')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('overview_stats.welcome_back', {
              name: session?.user.name || 'User',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="gap-2 cursor-pointer shadow-xs"
            render={<Link href="/dashboard/blog/new" />}
          >
            <PlusCircle className="size-4" />
            <span>{t('new_post')}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('overview_stats.total_articles')}
            </CardTitle>
            <FileText className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('overview_stats.total_articles_desc', {
                published: publishedPosts,
                drafts: draftPosts,
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('overview_stats.published_title')}
            </CardTitle>
            <Badge variant="softGreen" className="text-xs">
              {t('overview_stats.published_badge')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {publishedPosts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('overview_stats.published_desc')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('overview_stats.drafts_title')}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {t('overview_stats.drafts_badge')}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {draftPosts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('overview_stats.drafts_desc')}</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('overview_stats.users_title')}
              </CardTitle>
              <Users className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {totalUsers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('overview_stats.users_desc')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t('overview_stats.content_title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('overview_stats.content_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer"
              render={<Link href="/dashboard/posts" />}
            >
              <FileText className="size-4" />
              <span>{t('posts')}</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-2 cursor-pointer"
              render={<Link href="/dashboard/blog/new" />}
            >
              <PlusCircle className="size-4" />
              <span>{t('new_post')}</span>
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-border/70 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t('overview_stats.access_title')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('overview_stats.access_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer"
                render={<Link href="/dashboard/users" />}
              >
                <ShieldCheck className="size-4 text-purple-500" />
                <span>{t('users')}</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
