import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { Section, SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { ContactForm } from './contact-form'
import { ContactInfo } from './contact-info'

interface ContactSectionProps {
  className?: string
}

export async function ContactSection({ className }: ContactSectionProps) {
  const t = await getTranslations('contact')

  return (
    <Section
      withGlow
      className={className}
      topGlowColor="bg-purple-50/50 dark:bg-purple-950/20"
      bottomGlowColor="bg-blue-50/50 dark:bg-blue-950/20"
      containerClassName="flex flex-col group/anim"
    >
      {/* Section Header */}
      <SectionHeader align="center" className="mb-12">
        <Badge variant="softPrimary" size="lg">
          {t('badge')}
        </Badge>

        <SectionTitle as="h2">
          {t('title_prefix')} <AnimatedText text={t('title_highlight')} className="text-primary" />
        </SectionTitle>

        <SectionDescription className="max-w-xl">{t('description')}</SectionDescription>
      </SectionHeader>

      {/* 2-Column Responsive Layout */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ContactInfo className="h-full" />
        </div>

        <div className="lg:col-span-7">
          <ContactForm className="h-full" />
        </div>
      </div>
    </Section>
  )
}
