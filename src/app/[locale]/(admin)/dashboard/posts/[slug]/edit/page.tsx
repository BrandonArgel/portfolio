import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DashboardErrorState } from '@/components/shared/dashboard-error-state'
import { BlogComposer } from '@/features/blog/components/blog-composer'
import { getAllCategoriesAdmin, getPostBySlug } from '@/features/blog/services/posts-service'
import type { Locale } from '@/i18n/routing'
import { getOptionalSession } from '@/lib/auth/get-optional-session'
import { assertNever } from '@/utils/result'

interface EditPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const [t, [err, post]] = await Promise.all([
    getTranslations({ locale, namespace: 'features.blog.editor' }),
    getPostBySlug(slug),
  ])

  if (err || !post) {
    return { title: `${t('post_not_found')}` }
  }

  return {
    title: `${t('editing_post')}: ${post.title}`,
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const [{ slug, locale }, session] = await Promise.all([params, getOptionalSession()])

  if (!session?.user) redirect(`/${locale}/login`)

  const [[err, post], [categoriesErr, allCategories]] = await Promise.all([
    getPostBySlug(slug),
    getAllCategoriesAdmin(),
  ])

  if (err) {
    switch (err.reason) {
      case 'POST_NOT_FOUND':
        return notFound()
      case 'DATABASE_ERROR': {
        const t = await getTranslations({ locale, namespace: 'features.blog.editor' })
        return (
          <DashboardErrorState
            title={t('error_loading')}
            description={t('error_loading_description')}
          />
        )
      }
      default:
        return assertNever(err)
    }
  }

  if (!post) return notFound()

  if (session.user.role !== 'admin' && post.authorId !== session.user.id) {
    redirect(`/${locale}/dashboard/posts`)
  }

  if (categoriesErr) {
    switch (categoriesErr.reason) {
      case 'DATABASE_ERROR':
        console.error('Error loading categories for post editor:', categoriesErr.details)
        break
      default:
        return assertNever(categoriesErr.reason)
    }
  }
  const categoriesArray = allCategories?.map((c) => c.name) ?? []

  const initialFrontmatter = {
    title: post.title,
    slug: post.slug,
    description: post.description || '',
    coverImage: post.coverImage || '',
    coverImageAlt: post.coverImageAlt || '',
    canonicalUrl: post.canonicalUrl || '',
    locale: post.locale as Locale,
    translationGroupId: post.translationGroupId || '',
    published: post.published,
    draft: post.draft,
    categories: post.categories.map((c) => c.name),
  }

  return (
    <BlogComposer
      initialId={post.id}
      initialFrontmatter={initialFrontmatter}
      initialContent={post.draftContent ?? post.content}
      existingCategories={categoriesArray}
      initialUpdatedAt={post.updatedAt.toISOString()}
      authorName={post.authorName}
      authorImage={post.authorImage}
      authorEmailVerified={post.authorEmailVerified}
      viewsCount={post.viewsCount}
      lastEditorName={post.lastEditorName}
      currentUserName={session.user.name}
      currentUserImage={session.user.image}
      currentUserEmailVerified={Boolean(session.user.emailVerified)}
    />
  )
}
