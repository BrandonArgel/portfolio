import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DashboardErrorState } from '@/components/shared/dashboard-error-state'
import { CategoriesManager } from '@/features/blog/components/admin/categories-manager'
import { getAdminCategoriesWithMetrics } from '@/features/blog/services/categories-service'
import { getOptionalSession } from '@/lib/auth/get-optional-session'
import { assertNever } from '@/utils/result'

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
  const [{ locale }, session] = await Promise.all([params, getOptionalSession()])

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  const [categoriesErr, categoriesData] = await getAdminCategoriesWithMetrics()

  if (categoriesErr || !categoriesData) {
    if (categoriesErr) {
      switch (categoriesErr.reason) {
        case 'DATABASE_ERROR':
          break
        default:
          return assertNever(categoriesErr.reason)
      }
    }

    const t = await getTranslations({
      locale,
      namespace: 'features.blog.categories',
    })

    return (
      <DashboardErrorState
        title={t('error_loading')}
        description={t('error_loading_description')}
      />
    )
  }

  return <CategoriesManager initialCategories={categoriesData} />
}
