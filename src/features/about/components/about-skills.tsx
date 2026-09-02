import { getLocale, getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { ABOUT_SKILL_CATEGORIES } from '../constants/about-data'
import { AboutSkillCard } from './about-skill-card'

export async function AboutSkills() {
  const t = await getTranslations('about.skills')
  const locale = ((await getLocale()) || 'en') as 'en' | 'es'

  return (
    <Section
      withGlow
      topGlowColor=""
      bottomGlowColor="bg-blue-50/50 dark:bg-blue-950/20"
      containerClassName="flex flex-col items-center group/anim"
    >
      <SectionHeader align="center" className="mb-12">
        <Badge variant="softPrimary" size="lg">
          {t('badge')}
        </Badge>
        <SectionTitle as="h2">
          <AnimatedText text={t('title')} className="text-primary" />
        </SectionTitle>
        <SectionDescription>{t('description')}</SectionDescription>
      </SectionHeader>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {ABOUT_SKILL_CATEGORIES.map((category) => {
          const title = category.title[locale] || category.title.en
          const description = t(`cards.${category.key}`)

          return (
            <AboutSkillCard
              key={category.key}
              icon={category.icon}
              title={title}
              description={description}
              skills={category.skills}
            />
          )
        })}
      </div>
    </Section>
  )
}
