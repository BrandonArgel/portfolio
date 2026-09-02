import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AboutSection } from '@/features/about'
import { constructPageMetadata } from '@/lib/seo'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.about' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/about',
  })
}

export default function AboutPage() {
  return <AboutSection />
}
