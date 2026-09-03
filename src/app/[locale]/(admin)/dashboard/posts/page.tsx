import { desc, eq } from 'drizzle-orm'
import { Edit3, PlusCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { DeletePostButton } from '@/features/blog/components/admin/delete-button'
import { PostPublishToggle } from '@/features/blog/components/admin/publish-toggle'
import { auth } from '@/lib/auth/auth'

interface DashboardPostsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: DashboardPostsPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'dashboard.posts_management',
  })

  return {
    title: `${t('title')} | Brandon Argel`,
  }
}

export default async function DashboardPostsPage({ params }: DashboardPostsPageProps) {
  const { locale } = await params

  // 1. Retrieve session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    redirect(`/${locale}/login`)
  }

  const t = await getTranslations({
    locale,
    namespace: 'dashboard.posts_management',
  })

  // 2. Query posts belonging to user or all posts if admin
  const userPosts =
    session.user.role === 'admin'
      ? await db.query.posts.findMany({
          orderBy: [desc(posts.createdAt)],
        })
      : await db.query.posts.findMany({
          where: eq(posts.authorId, session.user.id),
          orderBy: [desc(posts.createdAt)],
        })

  return (
    <div className="section-container py-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('session_as', {
              name: session.user.name || 'User',
              role: session.user.role || 'user',
            })}
          </p>
        </div>

        <LinkButton
          href={`/dashboard/blog/new`}
          size="sm"
          className="gap-2 cursor-pointer shadow-xs w-fit"
        >
          <PlusCircle className="size-4" />
          <span>New Article</span>
        </LinkButton>
      </header>

      {userPosts.length === 0 ? (
        <Card className="border-border/70 p-12 text-center">
          <p className="text-muted-foreground text-sm">{t('no_posts')}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {userPosts.map((post) => {
            const formattedDate = new Intl.DateTimeFormat(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(new Date(post.createdAt))

            return (
              <Card
                key={post.id}
                className="border-border/70 hover:border-border transition-all shadow-xs"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="font-semibold text-base text-foreground truncate">
                        {post.title}
                      </h2>
                      <PostPublishToggle postId={post.id} initialPublished={post.published} />
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                        {post.locale}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono">
                      /{post.slug} • {formattedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <LinkButton
                      variant="outline"
                      size="sm"
                      className="gap-1.5 cursor-pointer text-xs h-8"
                      href={`/dashboard/blog/${post.slug}/edit`}
                    >
                      <Edit3 className="size-3.5" />
                      <span>Edit</span>
                    </LinkButton>

                    <DeletePostButton postId={post.id} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
