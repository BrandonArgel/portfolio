import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/section'
import { BlogSearchInput } from './BlogSearchInput'

export async function BlogHeader() {
  const t = await getTranslations('blog')

  return (
    <SectionHeader className="mb-12" align="center">
      <Badge variant="softPrimary" size="lg">
        {t('badge')}
      </Badge>

      <SectionTitle as="h1">
        {t('title_line1')} <AnimatedText text={t('title_line2')} className="text-primary" />
      </SectionTitle>

      <SectionDescription className="max-w-2xl">{t('subtitle')}</SectionDescription>

      {/* Search Bar */}
      <div className="w-full mt-4">
        <BlogSearchInput />
      </div>
    </SectionHeader>
  )
}
