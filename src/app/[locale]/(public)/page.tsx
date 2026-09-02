import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RecentPostsSection } from '@/features/blog'
import { ContactSection } from '@/features/contact'
import { HeroSection } from '@/features/hero'
import { ServicesSection } from '@/features/services'
import { TestimonialsSection } from '@/features/testimonials'
import { constructPageMetadata } from '@/lib/seo'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.home' })

  return constructPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
    pathname: '',
  })
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <RecentPostsSection />
      <ContactSection />
    </>
  )
}
