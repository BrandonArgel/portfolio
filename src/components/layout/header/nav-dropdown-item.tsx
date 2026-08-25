'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import type { NavSectionColor } from '@/config/nav'
import { cn } from '@/lib/utils'

const containerVariants = cva(
  'group flex items-start gap-3.5 select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors duration-200',
  {
    variants: {
      color: {
        emerald: 'hover:bg-emerald-500/10 focus:bg-emerald-500/10',
        purple: 'hover:bg-purple-500/10 focus:bg-purple-500/10',
        blue: 'hover:bg-blue-500/10 focus:bg-blue-500/10',
        cyan: 'hover:bg-cyan-500/10 focus:bg-cyan-500/10',
        default: 'hover:bg-accent focus:bg-accent',
      },
      isActive: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        color: 'emerald',
        isActive: true,
        className: 'bg-emerald-500/15',
      },
      {
        color: 'purple',
        isActive: true,
        className: 'bg-purple-500/15',
      },
      {
        color: 'blue',
        isActive: true,
        className: 'bg-blue-500/15',
      },
      {
        color: 'cyan',
        isActive: true,
        className: 'bg-cyan-500/15',
      },
      {
        color: 'default',
        isActive: true,
        className: 'bg-accent',
      },
    ],
    defaultVariants: {
      color: 'default',
      isActive: false,
    },
  },
)

const iconWrapperVariants = cva(
  'p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0',
  {
    variants: {
      color: {
        emerald:
          'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 group-hover:scale-105',
        purple:
          'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 group-hover:scale-105',
        blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 group-hover:scale-105',
        cyan: 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20 group-hover:scale-105',
        default: 'bg-muted text-primary group-hover:bg-accent group-hover:scale-105',
      },
      isActive: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        color: 'emerald',
        isActive: true,
        className: 'bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/30',
      },
      {
        color: 'purple',
        isActive: true,
        className: 'bg-purple-500/20 text-purple-500 ring-1 ring-purple-500/30',
      },
      {
        color: 'blue',
        isActive: true,
        className: 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/30',
      },
      {
        color: 'cyan',
        isActive: true,
        className: 'bg-cyan-500/20 text-cyan-500 ring-1 ring-cyan-500/30',
      },
      {
        color: 'default',
        isActive: true,
        className: 'bg-primary text-primary-foreground',
      },
    ],
    defaultVariants: {
      color: 'default',
      isActive: false,
    },
  },
)

const titleVariants = cva(
  'text-sm font-medium leading-none mb-1.5 transition-colors duration-200',
  {
    variants: {
      color: {
        emerald: 'text-foreground group-hover:text-emerald-500 group-focus:text-emerald-500',
        purple: 'text-foreground group-hover:text-purple-500 group-focus:text-purple-500',
        blue: 'text-foreground group-hover:text-blue-500 group-focus:text-blue-500',
        cyan: 'text-foreground group-hover:text-cyan-500 group-focus:text-cyan-500',
        default: 'text-foreground group-hover:text-primary group-focus:text-primary',
      },
      isActive: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        color: 'emerald',
        isActive: true,
        className: 'text-emerald-500 font-semibold',
      },
      {
        color: 'purple',
        isActive: true,
        className: 'text-purple-500 font-semibold',
      },
      {
        color: 'blue',
        isActive: true,
        className: 'text-blue-500 font-semibold',
      },
      {
        color: 'cyan',
        isActive: true,
        className: 'text-cyan-500 font-semibold',
      },
      {
        color: 'default',
        isActive: true,
        className: 'text-primary font-semibold',
      },
    ],
    defaultVariants: {
      color: 'default',
      isActive: false,
    },
  },
)

export interface NavDropdownItemProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>,
    VariantProps<typeof containerVariants> {
  href: string
  title: string
  description?: string
  iconNode?: React.ReactNode
  color?: NavSectionColor
}

export function NavDropdownItem({
  href,
  title,
  description,
  iconNode,
  color = 'default',
  className,
  ...props
}: NavDropdownItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <li>
      <NavigationMenuLink
        className={cn(containerVariants({ color, isActive }), className)}
        render={<Link href={href} {...props} />}
      >
        {iconNode && <div className={cn(iconWrapperVariants({ color, isActive }))}>{iconNode}</div>}
        <div className="flex-1 min-w-0">
          <div className={cn(titleVariants({ color, isActive }))}>{title}</div>
          {description && (
            <p
              className={cn(
                'line-clamp-2 text-xs leading-relaxed transition-colors duration-200',
                isActive
                  ? 'text-foreground/90 font-medium'
                  : 'text-muted-foreground group-hover:text-foreground/80',
              )}
            >
              {description}
            </p>
          )}
        </div>
      </NavigationMenuLink>
    </li>
  )
}
