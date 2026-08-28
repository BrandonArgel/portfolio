'use client'

import { LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AuthButtonsProps {
  className?: string
  size?: 'default' | 'sm' | 'xs' | 'lg'
  onNavigate?: () => void
  orientation?: 'horizontal' | 'vertical'
}

export function AuthButtons({
  className,
  size = 'sm',
  onNavigate,
  orientation = 'horizontal',
}: AuthButtonsProps) {
  const isVertical = orientation === 'vertical'
  const t = useTranslations('common.actions')

  return (
    <div
      className={cn('flex items-center gap-2', isVertical && 'w-full flex-col gap-2.5', className)}
    >
      <LinkButton
        href="/login"
        size={size}
        onClick={onNavigate}
        className={cn(
          'gap-1.5 font-medium transition-colors hover:text-foreground',
          isVertical && 'w-full justify-center',
        )}
      >
        <LogIn className="size-4" />
        <span>{t('sign_in')}</span>
      </LinkButton>
    </div>
  )
}
