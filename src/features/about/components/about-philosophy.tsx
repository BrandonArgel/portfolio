import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { ABOUT_PHILOSOPHY_PRINCIPLES } from '../constants/about-data'
import { AboutPhilosophyCard } from './about-philosophy-card'

export async function AboutPhilosophy() {
  const t = await getTranslations('features.about.philosophy')

  return (
    <Section
      withGlow
      topGlowColor=""
      bottomGlowColor="bg-purple-50/50 dark:bg-purple-950/20"
      containerClassName="flex flex-col items-center group/anim"
    >
      <SectionHeader align="center" className="mb-12">
        <Badge variant="softPrimary" size="lg">
          {t('badge')}
        </Badge>
        <SectionTitle as="h2">
          {t('title_prefix')} <AnimatedText text={t('title')} className="text-primary" />
        </SectionTitle>
        <SectionDescription>{t('description')}</SectionDescription>
      </SectionHeader>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ABOUT_PHILOSOPHY_PRINCIPLES.map((principle, index) => {
          const title = t(`items.${principle.key}.title`)
          const description = t(`items.${principle.key}.description`)

          return (
            <AboutPhilosophyCard
              key={principle.key}
              icon={principle.icon}
              title={title}
              description={description}
              index={index}
              color={principle.color}
            />
          )
        })}
      </div>
    </Section>
  )
}
