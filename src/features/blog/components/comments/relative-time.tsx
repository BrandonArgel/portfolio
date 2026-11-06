'use client'

import { useFormatter } from 'next-intl'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface RelativeTimeProps {
  date: Date | string
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const format = useFormatter()
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date>(() => new Date())

  const dateObj = date instanceof Date ? date : new Date(date)
  const timestampMs = dateObj.getTime()

  useEffect(() => {
    setMounted(true)
    setNow(new Date())

    const ageMs = Math.abs(Date.now() - timestampMs)
    const intervalMs = ageMs < 60 * 60 * 1000 ? 15_000 : 60_000

    const timer = window.setInterval(() => {
      setNow(new Date())
    }, intervalMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [timestampMs])

  const fullTimestamp = format.dateTime(dateObj, 'short')

  const displayValue = mounted
    ? format.relativeTime(dateObj.getTime() > now.getTime() ? now : dateObj, now)
    : fullTimestamp

  return (
    <time
      dateTime={dateObj.toISOString()}
      title={fullTimestamp}
      suppressHydrationWarning
      className={cn('text-xs text-muted-foreground', className)}
    >
      {displayValue}
    </time>
  )
}
