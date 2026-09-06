import { ArrowRight, Download } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import { PingDot } from '@/components/ui/ping-dot'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { AboutProfileFrame } from './about-profile-frame'

export async function AboutHero() {
  const t = await getTranslations('features.about.hero')

  return (
    <Section
      withGlow
      containerClassName="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group/anim"
    >
      <div className="flex flex-col gap-6">
        <SectionHeader align="left">
          <Badge variant="softPrimary" size="lg">
            <PingDot className="mr-1" /> {t('badge')}
          </Badge>

          <SectionTitle as="h1">
            {t('title_prefix')} <AnimatedText text={t('name')} className="text-primary" />
          </SectionTitle>

          <p className="max-w-xl text-base sm:text-lg font-medium leading-relaxed text-foreground/90">
            {t('purpose')}
          </p>

          <SectionDescription className="max-w-xl">{t('bio_secondary')}</SectionDescription>
        </SectionHeader>

        <div className="flex flex-wrap items-center gap-4">
          <LinkButton href="/contact" size="lg" variant="default" className="gap-2">
            <span>{t('get_in_touch')}</span>
            <ArrowRight className="size-4" />
          </LinkButton>

          <LinkButton href="/resume" size="lg" variant="outline" className="gap-2">
            <Download className="size-4" />
            <span>{t('download_resume')}</span>
          </LinkButton>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <AboutProfileFrame />
      </div>
    </Section>
  )
}
