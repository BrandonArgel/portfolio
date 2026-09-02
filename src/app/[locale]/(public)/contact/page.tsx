import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ContactSection } from '@/features/contact'
import { constructPageMetadata } from '@/lib/seo'

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.contact' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '/contact',
  })
}

export default function ContactPage() {
  return <ContactSection />
}
