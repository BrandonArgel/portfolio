import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BlogEditor } from '@/features/blog/components/blog-editor'
import { auth } from '@/lib/auth/auth'
import { getPostBySlug } from '@/services/posts.service'

interface EditPostPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog_editor' })
  const [err, post] = await getPostBySlug(slug)

  if (err || !post) {
    return { title: `${t('post_not_found')} | Brandon Argel` }
  }

  return {
    title: `${t('editing_post')}: ${post.title} | Brandon Argel`,
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug, locale } = await params

  // Verify authentication and authorization
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user) {
    redirect(`/${locale}/login`)
  }

  const [err, post] = await getPostBySlug(slug)

  if (err || !post) return notFound()

  // Only admins or the original author can edit a post
  if (session.user.role !== 'admin' && post.authorId !== session.user.id) {
    redirect(`/${locale}/dashboard/posts`)
  }

  const tagsString = post.tags.map((t) => `"${t.name}"`).join(', ')

  const initialMarkdown = `---
title: "${post.title}"
slug: "${post.slug}"
locale: "${post.locale}"
translationGroupId: "${post.translationGroupId || ''}"
published: ${post.published}
tags: [${tagsString}]
---
${post.content}`

  return (
    <div className="container py-8">
      <BlogEditor initialId={post.id} initialContent={initialMarkdown} />
    </div>
  )
}
