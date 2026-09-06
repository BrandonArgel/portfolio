import { Edit3, FileText, PlusCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LOCALE_META } from '@/config/locale'
import { AdminPagination } from '@/features/blog/components/admin/admin-pagination'
import { DeletePostButton } from '@/features/blog/components/admin/delete-button'
import { PostTableToolbar } from '@/features/blog/components/admin/post-table-toolbar'
import { PostPublishToggle } from '@/features/blog/components/admin/publish-toggle'
import { getAdminPosts, getAllCategoriesAdmin } from '@/features/blog/services/posts.service'
import { auth } from '@/lib/auth/auth'

interface DashboardPostsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    locale?: string
    category?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: DashboardPostsPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'features.blog.management',
  })

  return {
    title: `${t('title')} | Brandon Argel`,
  }
}

export default async function DashboardPostsPage({
  params,
  searchParams,
}: DashboardPostsPageProps) {
  const { locale } = await params
  const sp = await searchParams

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    redirect(`/${locale}/login`)
  }

  const isAdmin = session.user.role === 'admin'
  const currentPage = Math.max(1, Number(sp.page) || 1)
  const searchQuery = sp.q || ''
  const localeFilter = sp.locale || ''
  const categoryFilter = sp.category || ''

  const [t, format, postsResult, categoriesResult] = await Promise.all([
    getTranslations({
      locale,
      namespace: 'features.blog.management',
    }),
    getFormatter({ locale }),
    getAdminPosts({
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      locale: localeFilter || undefined,
      categoryId: categoryFilter || undefined,
      userId: session.user.id,
      isAdmin,
    }),
    getAllCategoriesAdmin(),
  ])

  const [postsError, postsData] = postsResult
  const [_, categoriesData] = categoriesResult

  if (postsError) {
    // Fallback — show empty state on error
    return (
      <div className="section-container py-6 space-y-6">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>{t('no_posts')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const { posts: userPosts, totalPages, totalCount } = postsData
  const allCategories = categoriesData ?? []

  // Compute showing range
  const limit = 10
  const from = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalCount)

  // Build searchParams record for pagination links
  const paginationSearchParams: Record<string, string | undefined> = {
    q: searchQuery || undefined,
    locale: localeFilter || undefined,
    category: categoryFilter || undefined,
  }

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
          href={'/dashboard/blog/new'}
          size="sm"
          className="gap-2 cursor-pointer shadow-xs w-fit"
        >
          <PlusCircle className="size-4" />
          <span>{t('new_article')}</span>
        </LinkButton>
      </header>

      {/* Toolbar: Search + Filters */}
      <PostTableToolbar
        categories={allCategories}
        initialSearch={searchQuery}
        initialLocale={localeFilter}
        initialCategory={categoryFilter}
      />

      {/* Results count */}
      {totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('showing_results', { from, to, total: totalCount })}
        </p>
      )}

      {/* Post List */}
      {userPosts.length === 0 ? (
        <Empty className="py-16 border border-dashed border-border/70 rounded-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>
              {searchQuery || localeFilter || categoryFilter ? t('no_results') : t('no_posts')}
            </EmptyTitle>
            {(searchQuery || localeFilter || categoryFilter) && (
              <EmptyDescription>{t('no_posts')}</EmptyDescription>
            )}
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {userPosts.map((post) => {
            const formattedDate = format.dateTime(new Date(post.createdAt), 'short')

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
                      <Tooltip>
                        <TooltipTrigger>
                          {LOCALE_META[post.locale as keyof typeof LOCALE_META]?.flag}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{LOCALE_META[post.locale as keyof typeof LOCALE_META]?.nativeName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono">
                      /{post.slug} • {formattedDate}
                    </p>

                    {/* Category pills */}
                    {post.categories.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {post.categories.map((cat) => (
                          <Badge key={cat.id} variant="outline" className="text-xs font-normal">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <LinkButton
                      variant="outline"
                      size="sm"
                      className="gap-1.5 cursor-pointer text-xs h-8"
                      href={`/dashboard/blog/${post.slug}/edit`}
                    >
                      <Edit3 className="size-3.5" />
                      <span>{t('edit')}</span>
                    </LinkButton>

                    <DeletePostButton postId={post.id} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={paginationSearchParams}
        prevText={t('prev_page')}
        nextText={t('next_page')}
      />
    </div>
  )
}
