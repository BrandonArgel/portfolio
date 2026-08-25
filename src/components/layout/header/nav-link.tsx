'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  title: string
}

export function NavItemLink({ href, title }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <NavigationMenuLink
      className={cn(
        navigationMenuTriggerStyle(),
        'bg-transparent relative rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
        isActive &&
          'text-primary hover:text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full',
      )}
      render={<Link href={href} />}
    >
      {title}
    </NavigationMenuLink>
  )
}
