import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminHeader, SessionGuard } from '@/features/dashboard'
import { auth } from '@/lib/auth/auth'

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

  const isBanned = Boolean((session?.user as { banned?: boolean })?.banned)

  // 2. Protect route: only active 'admin' or 'editor' roles are allowed in dashboard
  if (!session || !session.user || session.user.role === 'user' || isBanned) {
    redirect(`/${locale}/login`)
  }

  const isAdmin = session.user.role === 'admin'
  const isEditor = session.user.role === 'editor'

  return (
    <SessionGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Unified Admin Dashboard Header */}
        <AdminHeader session={session} isAdmin={isAdmin} isEditor={isEditor} />

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>
      </div>
    </SessionGuard>
  )
}
