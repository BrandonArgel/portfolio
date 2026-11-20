import { BookOpen, Home } from 'lucide-react'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Link from 'next/link'
import { NotFoundView } from '@/components/shared/not-found-view'
import { buttonVariants } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: `404 - Page Not Found | ${siteConfig.name}`,
  description: 'The page you are looking for does not exist or has been moved.',
}

export default function GlobalNotFound() {
  const defaultLocale = routing.defaultLocale

  return (
    <html lang={defaultLocale} className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <main className="flex flex-1 flex-col overflow-clip">
          <NotFoundView
            badge="Error 404"
            title="Page not found"
            description="Sorry, the page you are looking for doesn't exist, was moved, or is no longer available."
            actions={
              <>
                <Link
                  href={`/${defaultLocale}`}
                  className={cn(buttonVariants({ size: 'lg' }), 'gap-2 rounded-xl px-5')}
                >
                  <Home className="size-4" />
                  <span>Back to Home</span>
                </Link>
                <Link
                  href={`/${defaultLocale}/blog`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'gap-2 rounded-xl px-5',
                  )}
                >
                  <BookOpen className="size-4" />
                  <span>Explore Blog</span>
                </Link>
              </>
            }
          />
        </main>
      </body>
    </html>
  )
}
