import { headers } from 'next/headers'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { auth } from '@/lib/auth/auth'
import { CommandPalette } from '../command-palette'
import { AuthActions } from './auth-actions'
import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md transition-colors supports-backdrop-filter:bg-background/60">
      <div className="section-container max-w-7xl h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg transition-transform active:scale-95"
          aria-label="Go to home page"
        >
          <Logo />
        </Link>

        <DesktopNav className="hidden xl:flex" />

        <div className="flex items-center gap-2 sm:gap-3">
          <CommandPalette />
          <AuthActions className="hidden xl:flex" initialSession={session} />
          <MobileNav className="inline-flex xl:hidden" />
        </div>
      </div>
    </header>
  )
}
