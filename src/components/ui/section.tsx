import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

interface SectionGlowProps {
  className?: string
  topColor?: string
  bottomColor?: string
}

function SectionGlow({
  className,
  topColor = 'bg-blue-100/50 dark:bg-blue-950/20',
  bottomColor = 'bg-purple-100/50 dark:bg-purple-950/20',
}: SectionGlowProps) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 -z-1', className)}>
      <div
        className={cn(
          'absolute top-0 left-0 h-125 w-125 -translate-x-1/2 -translate-y-1/4 rounded-full blur-3xl',
          topColor,
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 right-0 h-125 w-125 translate-x-1/2 translate-y-1/4 rounded-full blur-3xl',
          bottomColor,
        )}
      />
    </div>
  )
}

interface SectionProps extends ComponentPropsWithoutRef<'section'> {
  containerClassName?: string
  withGlow?: boolean
  topGlowColor?: string
  bottomGlowColor?: string
}

export function Section({
  children,
  className,
  containerClassName,
  withGlow = false,
  topGlowColor,
  bottomGlowColor,
  ...props
}: SectionProps) {
  return (
    <section className={cn('relative my-20', className)} {...props}>
      {withGlow && <SectionGlow topColor={topGlowColor} bottomColor={bottomGlowColor} />}
      <div className={cn('section-container', containerClassName)}>{children}</div>
    </section>
  )
}

interface SectionHeaderProps extends ComponentPropsWithoutRef<'div'> {
  align?: 'center' | 'left' | 'right'
}

export function SectionHeader({
  align = 'center',
  className,
  children,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        align === 'left' && 'items-start text-left',
        align === 'right' && 'items-end text-right',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface SectionTitleProps extends ComponentPropsWithoutRef<'h1'> {
  as?: HeadingLevel
}

export function SectionTitle({
  as: Component = 'h1',
  className,
  children,
  ...props
}: SectionTitleProps) {
  const isH1 = Component === 'h1'
  return (
    <Component
      className={cn(
        'font-bold leading-tight tracking-tight text-foreground',
        isH1 ? 'text-fluid-title' : 'text-fluid-subtitle',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function SectionDescription({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('max-w-2xl text-base text-muted-foreground md:text-lg', className)} {...props}>
      {children}
    </p>
  )
}
