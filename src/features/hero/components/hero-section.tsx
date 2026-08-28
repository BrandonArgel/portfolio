import { getTranslations } from 'next-intl/server'
import { SocialLinks } from '@/components/shared/social-icons'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { PingDot } from '@/components/ui/ping-dot'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { CircularFeatures } from './circular-features'
import { HeroActions } from './hero-actions'
import { HeroSkills } from './hero-skills'

export async function HeroSection() {
  const t = await getTranslations('hero')
  const skills = t.raw('skills')

  return (
    <Section
      withGlow
      containerClassName="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group/anim"
    >
      <div className="flex flex-col gap-4">
        <SectionHeader align="left">
          <Badge variant="softPrimary" size="lg">
            <PingDot className="mr-1" /> {t('badge')}
          </Badge>

          <SectionTitle as="h1">
            {t('title_line1')}
            <br />
            <AnimatedText text={t('title_line2')} className="text-primary" />
          </SectionTitle>

          <SectionDescription className="max-w-xl">{t('description')}</SectionDescription>
        </SectionHeader>

        <HeroSkills skills={skills} />

        <SocialLinks />

        <HeroActions />
      </div>

      <CircularFeatures />
    </Section>
  )
}
