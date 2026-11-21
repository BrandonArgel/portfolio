import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BlogComposer } from '@/features/blog/components/blog-composer'
import { getAllCategoriesAdmin } from '@/features/blog/services/posts-service'
import { getOptionalSession } from '@/lib/auth/get-optional-session'
import { assertNever } from '@/utils/result'

interface NewPostPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewPostPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'features.blog.editor' })

  return {
    title: `${t('new_post')} | Brandon Argel`,
  }
}

export default async function NewPostPage() {
  const [session, [categoriesErr, categories]] = await Promise.all([
    getOptionalSession(),
    getAllCategoriesAdmin(),
  ])

  if (categoriesErr) {
    switch (categoriesErr.reason) {
      case 'DATABASE_ERROR':
        console.error('Error loading categories for new post composer:', categoriesErr.details)
        break
      default:
        return assertNever(categoriesErr.reason)
    }
  }

  const categoriesArray = categories?.map((c) => c.name) ?? []

  return (
    <BlogComposer
      existingCategories={categoriesArray}
      currentUserName={session?.user?.name}
      currentUserImage={session?.user?.image}
      currentUserEmailVerified={Boolean(session?.user?.emailVerified)}
    />
  )
}
