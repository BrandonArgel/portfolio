import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/shared/logo'
import { Link } from '@/i18n/navigation'
import { auth } from '@/lib/auth/auth'
import { CommandPalette } from '../command-palette'
import { DesktopNav } from './ui/desktop-nav'
import { MobileNav } from './ui/mobile-nav'
import { UserPreferencesMenu } from './ui/user-menu'

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const t = await getTranslations('components.header')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md transition-colors supports-backdrop-filter:bg-background/60">
      <div className="section-container h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg transition-transform active:scale-95"
          aria-label={t('go_to_home')}
        >
          <Logo />
        </Link>

        <DesktopNav className="hidden xl:flex" />

        <div className="flex items-center gap-2 sm:gap-3">
          <CommandPalette />
          <UserPreferencesMenu initialSession={session} className="hidden xl:inline-flex" />
          <MobileNav className="inline-flex xl:hidden" />
        </div>
      </div>
    </header>
  )
}
