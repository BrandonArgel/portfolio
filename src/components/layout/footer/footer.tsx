import { ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Logo } from '@/components/shared/logo'
import { SocialLinks } from '@/components/shared/social-icons'
import { SpotifyWidget } from '@/features/spotify'
import { Link } from '@/i18n/navigation'
import { FooterNewsletter } from './footer-newsletter'

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="size-3.5 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
        <span>{label}</span>
      </Link>
    </li>
  )
}

export async function Footer() {
  const t = await getTranslations('components.footer')
  const tNav = await getTranslations('components.nav')

  const platformLinks = [
    { href: '/', label: tNav('home') },
    { href: '/about', label: tNav('about') },
    { href: '/contact', label: tNav('contact') },
    { href: '/services', label: tNav('services') },
  ]

  const contentLinks = [
    { href: '/blog', label: tNav('blog') },
    { href: '/courses', label: tNav('courses') },
  ]

  const resourceLinks = [
    { href: '/tools', label: tNav('tools') },
    { href: '/snippets', label: tNav('snippets') },
    { href: '/resume', label: tNav('resume') },
  ]

  return (
    <footer className="border-t border-border/40 bg-background/95 pt-16 backdrop-blur-md">
      <div className="section-container">
        {/* Main 12-Column Grid Layout */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {/* Section 1: Profile & Spotify (5 cols on lg, 12 on mobile) */}
          <div className="col-span-12 flex flex-col md:col-span-6">
            <div className="flex flex-col justify-center items-center md:justify-start md:items-start gap-4">
              <Logo />
              <p className="mt-3.5 text-sm text-center leading-relaxed text-muted-foreground md:text-left">
                {t('bio')}
              </p>
              <div className="mt-5 flex items-center gap-2.5">
                <SocialLinks />
              </div>
              <div className="mt-6 w-full max-w-xs mx-auto md:mx-0 md:flex-col md:justify-end">
                <SpotifyWidget />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 col-span-12 md:col-span-6">
            <div className="flex gap-8 justify-center md:justify-start md:gap-16">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {t('columns.platform')}
                </h3>
                <ul className="mt-4 space-y-3">
                  {platformLinks.map(({ href, label }) => (
                    <FooterLink key={href} href={href} label={label} />
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {t('columns.resources')}
                </h3>
                <ul className="mt-4 space-y-3">
                  {resourceLinks.map(({ href, label }) => (
                    <FooterLink key={href} href={href} label={label} />
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  {t('columns.content')}
                </h3>
                <ul className="mt-4 space-y-3">
                  {contentLinks.map(({ href, label }) => (
                    <FooterLink key={href} href={href} label={label} />
                  ))}
                </ul>
              </div>
            </div>
            <div className="w-full max-w-sm mx-auto md:mx-0">
              <FooterNewsletter />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/40 py-8 text-center text-xs text-muted-foreground md:flex-row md:text-left">
          <p>{t('legal.copyright')}</p>

          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-end">
            <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
              {t('legal.privacy')}
            </Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-foreground">
              {t('legal.terms')}
            </Link>
            <Link href="/cookies-policy" className="transition-colors hover:text-foreground">
              {t('legal.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
