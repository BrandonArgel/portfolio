import { BookOpen, Home, Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header/header'
import { NotFoundView } from '@/components/shared/not-found-view'
import { LinkButton } from '@/components/ui/button'

export default async function LocaleNotFound() {
  const t = await getTranslations('common.not_found')

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col overflow-clip">
        <NotFoundView
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
          actions={
            <>
              <LinkButton href="/" size="lg" className="gap-2 rounded-xl px-5">
                <Home className="size-4" />
                <span>{t('back_home')}</span>
              </LinkButton>
              <LinkButton
                href="/blog"
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl px-5"
              >
                <BookOpen className="size-4" />
                <span>{t('browse_blog')}</span>
              </LinkButton>
              <LinkButton
                href="/contact"
                variant="ghost"
                size="lg"
                className="gap-2 rounded-xl px-5"
              >
                <Mail className="size-4" />
                <span>{t('contact')}</span>
              </LinkButton>
            </>
          }
        />
      </main>
      <Footer />
    </>
  )
}
