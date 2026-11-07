import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CategoriesManager } from '@/features/blog/components/admin/categories-manager'
import { getAdminCategoriesWithMetrics } from '@/features/blog/services/categories-service'
import { auth } from '@/lib/auth/auth'

interface DashboardCategoriesPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: DashboardCategoriesPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'features.blog.categories',
  })

  return {
    title: `${t('title')} | Brandon Argel`,
  }
}

export default async function DashboardCategoriesPage({ params }: DashboardCategoriesPageProps) {
  const { locale } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  const [, categoriesData] = await getAdminCategoriesWithMetrics()
  const categories = categoriesData ?? []

  return <CategoriesManager initialCategories={categories} />
}
