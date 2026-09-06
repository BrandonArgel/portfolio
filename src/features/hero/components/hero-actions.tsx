import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/button'

export async function HeroActions() {
  const tActions = await getTranslations('features.hero')

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <LinkButton size="lg" href="/blog" className="group">
        <span>{tActions('read_blog')}</span>
        <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </LinkButton>
      <LinkButton size="lg" variant="outline" href="/resume">
        {tActions('view_resume')}
      </LinkButton>
    </div>
  )
}
