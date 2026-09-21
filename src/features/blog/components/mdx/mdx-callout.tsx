import {
  AlertOctagon,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Flame,
  Info,
  List,
  Pencil,
  Quote,
  XCircle,
} from 'lucide-react'
import type React from 'react'

import { cn } from '@/lib/utils'

export interface CalloutConfig {
  container: string
  icon: React.ReactNode
  defaultTitle: string
}

export const CALLOUT_STYLES: Record<string, CalloutConfig> = {
  tip: {
    container: 'border-callout-cyan bg-callout-cyan/10 text-callout-cyan-text',
    icon: <Flame className="size-5 shrink-0 text-callout-cyan" />,
    defaultTitle: 'Tip',
  },
  info: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Info className="size-5 shrink-0 text-callout-blue" />,
    defaultTitle: 'Info',
  },
  note: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Info className="size-5 shrink-0 text-callout-blue" />,
    defaultTitle: 'Note',
  },
  pencil: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Pencil className="size-5 shrink-0 text-callout-blue" />,
    defaultTitle: 'Note',
  },
  quote: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Quote className="size-5 shrink-0 text-callout-blue" />,
    defaultTitle: 'Quote',
  },
  success: {
    container: 'border-callout-green bg-callout-green/10 text-callout-green-text',
    icon: <CheckCircle2 className="size-5 shrink-0 text-callout-green" />,
    defaultTitle: 'Success',
  },
  warning: {
    container: 'border-callout-yellow bg-callout-yellow/10 text-callout-yellow-text',
    icon: <AlertTriangle className="size-5 shrink-0 text-callout-yellow" />,
    defaultTitle: 'Warning',
  },
  failure: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: <XCircle className="size-5 shrink-0 text-callout-red" />,
    defaultTitle: 'Failure',
  },
  danger: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: <AlertOctagon className="size-5 shrink-0 text-callout-red" />,
    defaultTitle: 'Danger',
  },
  bug: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: <Bug className="size-5 shrink-0 text-callout-red" />,
    defaultTitle: 'Bug',
  },
  example: {
    container: 'border-callout-purple bg-callout-purple/10 text-callout-purple-text',
    icon: <List className="size-5 shrink-0 text-callout-purple" />,
    defaultTitle: 'Example',
  },
}

export interface MdxCalloutProps {
  type?: string
  title?: string
  children?: React.ReactNode
  className?: string
}

export function MdxCallout({ type = 'info', title, children, className }: MdxCalloutProps) {
  const normalizedType = type.toLowerCase()
  const config = CALLOUT_STYLES[normalizedType] || CALLOUT_STYLES.info
  const displayTitle = title || config.defaultTitle

  return (
    <section
      aria-label={displayTitle}
      className={cn(
        'not-prose my-6 flex gap-3.5 rounded-r-xl border-l-4 p-4 text-sm shadow-xs transition-colors',
        config.container,
        className,
      )}
    >
      <div className="shrink-0 pt-0.5" aria-hidden="true">
        {config.icon}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 overflow-x-auto">
        {displayTitle && (
          <p className="font-semibold leading-snug tracking-tight text-foreground">
            {displayTitle}
          </p>
        )}
        <div className="leading-relaxed [&>p]:leading-relaxed [&>p:not(:first-child)]:mt-2">
          {children}
        </div>
      </div>
    </section>
  )
}
