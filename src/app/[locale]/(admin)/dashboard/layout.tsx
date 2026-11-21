import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardResizableLayout, DashboardSidebar } from '@/components/layout/sidebar'
import { getOptionalSession } from '@/lib/auth/get-optional-session'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const [{ locale }, cookieStore, session] = await Promise.all([
    params,
    cookies(),
    getOptionalSession(),
  ])

  const isBanned = Boolean((session?.user as { banned?: boolean })?.banned)

  if (!session?.user || session.user.role === 'user' || isBanned) {
    redirect(`/${locale}/login`)
  }

  const sidebarState = cookieStore.get('sidebar_state')
  const defaultOpen = sidebarState ? sidebarState.value === 'true' : true

  const isAdmin = session.user.role === 'admin'
  const isEditor = session.user.role === 'editor'

  return (
    <DashboardResizableLayout
      defaultOpen={defaultOpen}
      sidebar={
        <DashboardSidebar resizable session={session} isAdmin={isAdmin} isEditor={isEditor} />
      }
    >
      {children}
    </DashboardResizableLayout>
  )
}
