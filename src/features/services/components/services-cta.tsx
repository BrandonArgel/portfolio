import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/button'

export async function ServicesCta() {
  const t = await getTranslations('services.cta')

  return (
    <div className="mt-14 flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-muted-foreground md:text-base">{t('question')}</p>
      <LinkButton
        size="lg"
        href="/contact"
        className="group rounded-full px-6 shadow-lg shadow-primary/20"
      >
        <span>{t('action')}</span>
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </LinkButton>
    </div>
  )
}
