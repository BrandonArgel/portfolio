import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { constructPageMetadata } from '@/lib/seo'

interface ResumePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ResumePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.resume' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/resume',
  })
}

export default function ResumePage() {
  return null
}
