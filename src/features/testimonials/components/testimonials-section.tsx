import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { TestimonialCarousel } from './testimonial-carousel'

export async function TestimonialsSection() {
  const t = await getTranslations('features.testimonials')

  return (
    <Section withGlow containerClassName="flex flex-col items-center group/anim">
      <SectionHeader className="mb-10" align="center">
        <Badge variant="softPrimary" size="lg">
          {t('badge')}
        </Badge>

        <SectionTitle as="h2">
          {t('title_line1')} <AnimatedText text={t('title_line2')} className="text-primary" />
        </SectionTitle>

        <SectionDescription className="max-w-xl">{t('description')}</SectionDescription>
      </SectionHeader>

      <TestimonialCarousel />
    </Section>
  )
}
