'use client'

import { FileText, LayoutDashboard, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  isAdmin: boolean
}

export function DashboardNav({ isAdmin }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations('components.layout.dashboard')

  const navItems = [
    {
      href: '/dashboard',
      label: t('overview'),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/dashboard/posts',
      label: t('posts'),
      icon: FileText,
      exact: false,
    },
    ...(isAdmin
      ? [
          {
            href: '/dashboard/users',
            label: t('users'),
            icon: Users,
            exact: false,
          },
        ]
      : []),
  ]

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
