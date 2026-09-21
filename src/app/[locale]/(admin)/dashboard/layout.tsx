import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { SessionGuard } from '@/features/dashboard'
import { auth } from '@/lib/auth/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isBanned = Boolean((session?.user as { banned?: boolean })?.banned)

  if (!session?.user || session.user.role === 'user' || isBanned) {
    redirect(`/${locale}/login`)
  }

  const isAdmin = session.user.role === 'admin'
  const isEditor = session.user.role === 'editor'

  return (
    <SessionGuard>
      <SidebarProvider>
        <DashboardSidebar session={session} isAdmin={isAdmin} isEditor={isEditor} />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  )
}
