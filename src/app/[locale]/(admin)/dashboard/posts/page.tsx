import { Edit3, Eye, FileText, PlusCircle, Tags } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { AdminPagination } from '@/components/shared/admin-pagination'
import { DashboardErrorState } from '@/components/shared/dashboard-error-state'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { LinkButton } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LOCALE_META } from '@/config/locale'
import { DeletePostButton } from '@/features/blog/components/admin/delete-button'
import { PostTableToolbar } from '@/features/blog/components/admin/post-table-toolbar'
import { PostPublishToggle } from '@/features/blog/components/admin/publish-toggle'
import { normalizeAdminPostSort } from '@/features/blog/constants/blog'
import { getAdminPosts, getAllCategoriesAdmin } from '@/features/blog/services/posts-service'
import { Link } from '@/i18n/navigation'
import { auth } from '@/lib/auth/auth'
import { assertNever } from '@/utils/result'

interface DashboardPostsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    locale?: string
    category?: string
    sort?: string
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

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  const isAdmin = session.user.role === 'admin'
  const currentPage = Math.max(1, Number(sp.page) || 1)
  const searchQuery = sp.q || ''
  const localeFilter = sp.locale || ''
  const categoryFilter = sp.category || ''
  const sortFilter = normalizeAdminPostSort(sp.sort)

  // 1. Fetch categories first to resolve slug to ID
  const [categoriesError, categoriesData] = await getAllCategoriesAdmin()
  if (categoriesError) {
    switch (categoriesError.reason) {
      case 'DATABASE_ERROR':
        console.error('Error fetching categories for dashboard posts:', categoriesError.details)
        break
      default:
        return assertNever(categoriesError.reason)
    }
  }
  const allCategories = categoriesData ?? []

  // 2. Resolve category slug from URL to matching category id
  const categoryIdForQuery = categoryFilter
    ? allCategories.find((c) => c.slug === categoryFilter)?.id
    : undefined

  // 3. Fetch translations, formatter, and admin posts using categoryIdForQuery
  const [t, format, postsResult] = await Promise.all([
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
      categoryId: categoryIdForQuery,
      sort: sortFilter,
      userId: session.user.id,
      isAdmin,
    }),
  ])

  const [postsError, postsData] = postsResult

  if (postsError || !postsData) {
    if (postsError) {
      switch (postsError.reason) {
        case 'DATABASE_ERROR':
          break
        default:
          return assertNever(postsError.reason)
      }
    }

    return (
      <DashboardErrorState
        title={t('error_loading')}
        description={t('error_loading_description')}
      />
    )
  }

  const { posts: userPosts, totalPages, totalCount } = postsData

  // Compute showing range
  const limit = 10
  const from = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
  const to = Math.min(currentPage * limit, totalCount)

  // Build searchParams record for pagination links
  const paginationSearchParams: Record<string, string | undefined> = {
    q: searchQuery || undefined,
    locale: localeFilter || undefined,
    category: categoryFilter || undefined,
    sort: sortFilter !== 'latest' ? sortFilter : undefined,
  }

  return (
    <div className="space-y-4 p-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>{t('dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-2">
          <LinkButton
            href={'/dashboard/categories'}
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer shadow-xs w-fit"
          >
            <Tags className="size-4" />
            <span>{t('manage_categories')}</span>
          </LinkButton>

          <LinkButton
            href={'/dashboard/posts/new'}
            size="sm"
            className="gap-2 cursor-pointer shadow-xs w-fit"
          >
            <PlusCircle className="size-4" />
            <span>{t('new_article')}</span>
          </LinkButton>
        </div>
      </header>

      {/* Toolbar: Search + Filters */}
      <PostTableToolbar
        categories={allCategories}
        initialSearch={searchQuery}
        initialLocale={localeFilter}
        initialCategory={categoryFilter}
        initialSort={sortFilter}
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
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2.5 text-xs font-medium text-muted-foreground tabular-nums">
                            <Eye className="size-3.5" aria-hidden="true" />
                            <span aria-hidden="true">{format.number(post.viewsCount)}</span>
                            <span className="sr-only">
                              {t('views_count', {
                                count: post.viewsCount,
                                formattedCount: format.number(post.viewsCount),
                              })}
                            </span>
                          </span>
                        }
                      />
                      <TooltipContent>
                        {t('views_count', {
                          count: post.viewsCount,
                          formattedCount: format.number(post.viewsCount),
                        })}
                      </TooltipContent>
                    </Tooltip>

                    <LinkButton
                      variant="outline"
                      size="sm"
                      className="gap-1.5 cursor-pointer text-xs h-8"
                      href={`/dashboard/posts/${post.slug}/edit`}
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
