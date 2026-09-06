import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminPagination } from '@/features/blog/components/admin/admin-pagination'
import {
  getAdminUsers,
  UserActionsMenu,
  UserProviderBadge,
  UserRoleSelect,
  UserStatusBadge,
  UserTableToolbar,
  UserVerifiedBadge,
} from '@/features/users'
import { auth } from '@/lib/auth/auth'
import { getInitials } from '@/utils/get-initials'

interface UsersPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    q?: string
    role?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: UsersPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'features.users.management' })

  return {
    title: `${t('title')} | Brandon Argel`,
    description: t('description'),
  }
}

export default async function UsersPage({ params, searchParams }: UsersPageProps) {
  const { locale } = await params
  const sp = await searchParams

  // 1. Verify authentication and strictly require 'admin' role
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user || session.user.role !== 'admin') {
    redirect(`/${locale}/dashboard`)
  }

  const currentPage = Number(sp.page) || 1
  const limit = 10

  // 2. Fetch paginated users from Drizzle ORM service
  const [t, tDashboard, format, usersResult] = await Promise.all([
    getTranslations({ locale, namespace: 'features.users.management' }),
    getTranslations({ locale, namespace: 'components.layout.dashboard' }),
    getFormatter({ locale }),
    getAdminUsers({
      page: currentPage,
      limit,
      search: sp.q,
      role: sp.role,
    }),
  ])

  const [usersError, usersData] = usersResult

  if (usersError || !usersData) {
    return (
      <div className="section-container py-6 space-y-6">
        <div className="py-12 text-center text-sm text-destructive">
          Error loading users. Please try again.
        </div>
      </div>
    )
  }

  const usersList = usersData.users

  return (
    <div className="section-container py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Badge variant="softPrimary" className="w-fit">
          {usersData.totalCount} {t('user_col')}s
        </Badge>
      </div>

      {/* Toolbar Filter */}
      <UserTableToolbar initialSearch={sp.q} initialRole={sp.role} />

      {/* Data Table */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {usersList.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {sp.q || sp.role ? t('no_users_found') : t('no_users')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4">{t('user_col')}</TableHead>
                  <TableHead className="py-3 px-4">{t('provider_col')}</TableHead>
                  <TableHead className="py-3 px-4">{t('role_col')}</TableHead>
                  <TableHead className="py-3 px-4 text-center">{t('verified_col')}</TableHead>
                  <TableHead className="py-3 px-4">{t('status_col')}</TableHead>
                  <TableHead className="py-3 px-4">{t('created_at_col')}</TableHead>
                  <TableHead className="py-3 px-4 w-12 text-right">{t('actions_col')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((item) => {
                  const initials = getInitials(item.name)
                  const isSelf = item.id === session.user.id
                  const formattedDate = format.dateTime(new Date(item.createdAt), {
                    dateStyle: 'medium',
                  })

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                      {/* User Avatar + Name + Email */}
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-border shrink-0">
                            <AvatarImage src={item.image ?? undefined} alt={item.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground truncate max-w-35 sm:max-w-50">
                                {item.name}
                              </span>
                              {isSelf && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-4 px-1 text-primary border-primary/30 bg-primary/5 shrink-0"
                                >
                                  {tDashboard('you')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate max-w-35 sm:max-w-55">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Provider (Google, GitHub, Credential, etc.) */}
                      <TableCell className="py-3 px-4">
                        <UserProviderBadge providers={item.providers} />
                      </TableCell>

                      {/* Role Selector */}
                      <TableCell className="py-3 px-4">
                        <UserRoleSelect
                          userId={item.id}
                          currentRole={item.role}
                          userName={item.name}
                          disabled={isSelf}
                        />
                      </TableCell>

                      {/* Verified Badge */}
                      <TableCell className="py-3 px-4 text-center">
                        <UserVerifiedBadge emailVerified={item.emailVerified} />
                      </TableCell>

                      {/* Status Badge with Ban Tooltip */}
                      <TableCell className="py-3 px-4">
                        <UserStatusBadge
                          banned={item.banned}
                          banReason={item.banReason}
                          banExpires={item.banExpires}
                        />
                      </TableCell>

                      {/* Registered Date */}
                      <TableCell className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formattedDate}
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="py-3 px-4 text-right">
                        <UserActionsMenu
                          userId={item.id}
                          userName={item.name}
                          userEmail={item.email}
                          isBanned={item.banned}
                          isSelf={isSelf}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <AdminPagination
        currentPage={usersData.currentPage}
        totalPages={usersData.totalPages}
        searchParams={sp}
        prevText={t('prev_page')}
        nextText={t('next_page')}
      />
    </div>
  )
}
