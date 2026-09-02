import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { UserPreferencesMenu } from '@/components/layout/header/ui/user-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { auth } from '@/lib/auth/auth'
import { DashboardNav } from './_components/dashboard-nav'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params

  // 1. Retrieve session from Better Auth on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // 2. Protect route: only 'admin' or 'editor' roles are allowed in dashboard
  if (!session || !session.user || session.user.role === 'user') {
    redirect(`/${locale}`)
  }

  const isAdmin = session.user.role === 'admin'
  const isEditor = session.user.role === 'editor'
  const t = await getTranslations({ locale, namespace: 'dashboard' })

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground shrink-0"
                render={<Link href="/" />}
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">{t('back_to_site')}</span>
              </Button>

              <div className="h-4 w-px bg-border/80 hidden sm:block shrink-0" />

              <div className="flex items-center gap-2.5 truncate">
                <span className="font-bold text-base sm:text-lg tracking-tight truncate">
                  {t('title')}
                </span>
                {isAdmin && (
                  <Badge
                    variant="softPrimary"
                    className="text-[10px] h-4.5 px-1.5 py-0 font-medium shrink-0"
                  >
                    <ShieldCheck className="size-3 mr-1 text-primary" />
                    {t('roles.admin')}
                  </Badge>
                )}
                {isEditor && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4.5 px-1.5 py-0 font-medium text-blue-500 border-blue-500/30 bg-blue-500/10 shrink-0"
                  >
                    <Sparkles className="size-3 mr-1 text-blue-500" />
                    {t('roles.editor')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <UserPreferencesMenu initialSession={session} />
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="pb-3 pt-1 border-t border-border/40">
            <DashboardNav isAdmin={isAdmin} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
