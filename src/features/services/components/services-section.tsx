import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { ServicesCta } from './services-cta'
import { ServicesFilter } from './services-filter'

export async function ServicesSection() {
  const t = await getTranslations('features.services')

  return (
    <Section
      withGlow
      containerClassName="flex flex-col items-center group/anim"
      topGlowColor="bg-purple-50/50 dark:bg-purple-950/20"
      bottomGlowColor="bg-blue-50/50 dark:bg-blue-950/20"
    >
      <SectionHeader className="mb-10" align="center">
        <Badge variant="softPrimary" size="lg">
          {t('badge')}
        </Badge>

        <SectionTitle as="h2">
          {t('title_line1')} <AnimatedText text={t('title_line2')} className="text-primary" />
        </SectionTitle>

        <SectionDescription className="max-w-xl">{t('description')}</SectionDescription>
      </SectionHeader>

      <ServicesFilter />

      <ServicesCta />
    </Section>
  )
}
