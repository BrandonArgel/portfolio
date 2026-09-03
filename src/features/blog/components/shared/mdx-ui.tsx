import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Siren,
  StickyNote,
  XCircle,
} from 'lucide-react'
import type React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Callout theme maps
// ---------------------------------------------------------------------------

export const CALLOUT_STYLES: Record<string, string> = {
  info: 'border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200',
  note: 'border-blue-500 bg-blue-500/10 text-blue-950 dark:text-blue-200',
  warning: 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200',
  danger: 'border-red-500 bg-red-500/10 text-red-950 dark:text-red-200',
  error: 'border-red-500 bg-red-500/10 text-red-950 dark:text-red-200',
  tip: 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200',
  success: 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200',
}

export const CALLOUT_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="size-5 text-blue-500" />,
  note: <StickyNote className="size-5 text-blue-500" />,
  warning: <AlertTriangle className="size-5 text-amber-500" />,
  danger: <Siren className="size-5 text-red-500" />,
  error: <XCircle className="size-5 text-red-500" />,
  tip: <Lightbulb className="size-5 text-emerald-500" />,
  success: <CheckCircle2 className="size-5 text-emerald-500" />,
}

// ---------------------------------------------------------------------------
// Embeddable MDX components
// ---------------------------------------------------------------------------

export function YoutubeEmbed({
  id,
  title = 'YouTube video player',
}: {
  id: string
  title?: string
}) {
  return (
    <div className="not-typeset my-6 aspect-video w-full overflow-hidden rounded-xl border border-border shadow-sm">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export function Alert({
  children,
  variant = 'info',
  title,
}: {
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'danger' | 'error' | 'tip' | 'success' | 'note'
  title?: string
}) {
  const styleClass = CALLOUT_STYLES[variant] ?? CALLOUT_STYLES.info
  const icon = CALLOUT_ICONS[variant] ?? CALLOUT_ICONS.info

  return (
    <div className={cn('not-typeset my-5 flex gap-3 rounded-r-xl border-l-4 p-4', styleClass)}>
      <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        {title && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest opacity-80">{title}</p>
        )}
        <div className="m-0 text-sm leading-relaxed sm:text-base">{children}</div>
      </div>
    </div>
  )
}
