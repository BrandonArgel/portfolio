import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { constructPageMetadata } from '@/lib/seo'

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.privacy_policy' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/privacy-policy',
  })
}

export default function PrivacyPolicyPage() {
  return null
}
