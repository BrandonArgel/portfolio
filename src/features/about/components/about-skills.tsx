import { getTranslations } from 'next-intl/server'
import { Section, SectionHeader, SectionTitle } from '@/components/ui/section'
import { ABOUT_SKILL_CATEGORIES } from '../constants/about-data'
import { AboutSkillCard } from './about-skill-card'

export async function AboutSkills() {
  const t = await getTranslations('about')

  return (
    <Section
      withGlow
      topGlowColor=""
      bottomGlowColor="bg-blue-50/50 dark:bg-blue-950/20"
      containerClassName="flex flex-col items-center group/anim"
    >
      {/* Section Title */}
      <SectionHeader align="center" className="mb-12">
        <SectionTitle as="h2">{t('skills_title')}</SectionTitle>
      </SectionHeader>

      {/* 3-Card Skills Grid */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {ABOUT_SKILL_CATEGORIES.map((category) => {
          const title = t(`cards.${category.key}.title`)
          const description = t(`cards.${category.key}.description`)
          const skills: string[] = t.raw(`cards.${category.key}.skills`)

          return (
            <AboutSkillCard
              key={category.key}
              icon={category.icon}
              title={title}
              description={description}
              skills={skills}
            />
          )
        })}
      </div>
    </Section>
  )
}
