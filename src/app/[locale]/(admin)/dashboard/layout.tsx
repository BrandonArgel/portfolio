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

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isBanned = Boolean((session?.user as { banned?: boolean })?.banned)

  if (!session || !session.user || session.user.role === 'user' || isBanned) {
    redirect(`/${locale}/login`)
  }

  const isAdmin = session.user.role === 'admin'
  const isEditor = session.user.role === 'editor'

  return (
    <SessionGuard>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <AdminHeader session={session} isAdmin={isAdmin} isEditor={isEditor} />
        <main className="section-container flex-1 pt-4">{children}</main>
      </div>
    </SessionGuard>
  )
}
