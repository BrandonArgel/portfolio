import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { constructPageMetadata } from '@/lib/seo'

interface TermsOfServicePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: TermsOfServicePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.terms_of_service' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/terms-of-service',
  })
}

export default function TermsOfServicePage() {
  return null
}
