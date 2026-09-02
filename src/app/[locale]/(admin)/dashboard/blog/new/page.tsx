import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BlogEditor } from '@/features/blog/components/blog-editor'

interface NewPostPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: NewPostPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog_editor' })

  return {
    title: `${t('new_post')} | Brandon Argel`,
  }
}

export default function NewPostPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <BlogEditor />
    </div>
  )
}
