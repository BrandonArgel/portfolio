import { desc } from 'drizzle-orm'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/db'
import { user } from '@/db/schema'
import { UserRoleSelect } from '@/features/users/components/user-role-select'
import { auth } from '@/lib/auth/auth'
import { getInitials } from '@/utils/get-initials'

interface UsersPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: UsersPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'dashboard.users_management' })

  return {
    title: `${t('title')} | Brandon Argel`,
    description: t('description'),
  }
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { locale } = await params

  // 1. Verify authentication and strictly require 'admin' role
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || !session.user || session.user.role !== 'admin') {
    redirect(`/${locale}/dashboard`)
  }

  // 2. Fetch all users from Drizzle ORM
  const usersList = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
  })

  const [t, tDashboard, format] = await Promise.all([
    getTranslations({ locale, namespace: 'dashboard.users_management' }),
    getTranslations({ locale, namespace: 'dashboard' }),
    getFormatter({ locale }),
  ])

  return (
    <div className="section-container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Badge variant="softPrimary" className="w-fit">
          {usersList.length} {t('user_col')}s
        </Badge>
      </div>

      <Card className="border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
          <CardDescription className="text-xs">{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {usersList.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">{t('no_users')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/60">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      {t('user_col')}
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      {t('email_col')}
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      {t('role_col')}
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      {t('status_col')}
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      {t('created_at_col')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {usersList.map((item) => {
                    const initials = getInitials(item.name)
                    const isSelf = item.id === session.user.id
                    const formattedDate = format.dateTime(new Date(item.createdAt), 'short')

                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 border border-border">
                              <AvatarImage src={item.image ?? undefined} alt={item.name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{item.name}</span>
                                {isSelf && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] h-4 px-1 text-primary border-primary/30 bg-primary/5"
                                  >
                                    {tDashboard('you')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs font-mono">
                          {item.email}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <UserRoleSelect
                            userId={item.id}
                            currentRole={item.role}
                            userName={item.name}
                            disabled={isSelf}
                          />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.banned ? (
                            <Badge variant="destructive" className="text-xs">
                              {t('banned')}
                            </Badge>
                          ) : (
                            <Badge variant="softGreen" className="text-xs">
                              {t('active')}
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-muted-foreground">
                          {formattedDate}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
