import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
// import { SessionGuard } from '@/features/dashboard'
import { auth } from '@/lib/auth/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params
  const cookieStore = await cookies()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isBanned = Boolean((session?.user as { banned?: boolean })?.banned)

  if (!session?.user || session.user.role === 'user' || isBanned) {
    redirect(`/${locale}/login`)
  }

  const sidebarState = cookieStore.get('sidebar_state')
  const defaultOpen = sidebarState ? sidebarState.value === 'true' : true

  const isAdmin = session.user.role === 'admin'
  const isEditor = session.user.role === 'editor'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar session={session} isAdmin={isAdmin} isEditor={isEditor} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
