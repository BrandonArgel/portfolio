import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BlogComposer } from '@/features/blog/components/blog-composer'
import { getAllCategoriesAdmin, getPostBySlug } from '@/features/blog/services/posts.service'
import { auth } from '@/lib/auth/auth'

interface EditPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'features.blog.editor' })
  const [err, post] = await getPostBySlug(slug)

  if (err || !post) {
    return { title: `${t('post_not_found')}` }
  }

  return {
    title: `${t('editing_post')}: ${post.title}`,
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug, locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || !session.user) redirect(`/${locale}/login`)

  const [err, post] = await getPostBySlug(slug)

  if (err || !post) return notFound()

  if (session.user.role !== 'admin' && post.authorId !== session.user.id) {
    redirect(`/${locale}/dashboard/posts`)
  }

  const [, allCategories] = await getAllCategoriesAdmin()
  const categoriesArray = allCategories?.map((c) => c.name) ?? []

  const initialFrontmatter = {
    title: post.title,
    slug: post.slug,
    description: post.description || '',
    coverImage: post.coverImage || '',
    locale: post.locale as 'en' | 'es',
    translationGroupId: post.translationGroupId || '',
    published: post.published,
    categories: post.categories.map((c) => c.name),
  }

  return (
    <BlogComposer
      initialId={post.id}
      initialFrontmatter={initialFrontmatter}
      initialContent={post.content}
      existingCategories={categoriesArray}
    />
  )
}
