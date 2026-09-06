import {
  Activity,
  AlertTriangle,
  Bug,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Flame,
  HelpCircle,
  Info,
  KanbanSquare,
  LineChart,
  List,
  Pencil,
  Quote,
  Rocket,
  X,
  Zap,
} from 'lucide-react'
import { CALLOUT_CONFIG, COLOR_STYLES } from '@/features/blog/config/callout'
import { MDX_REGEX } from '@/features/blog/config/regex'
import { extractText } from '@/features/blog/utils/extract-text'
import { stripCalloutPrefix } from '@/features/blog/utils/strip-callout-prefix'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ReactNode> = {
  bug: <Bug className="size-5" />,
  zap: <Zap className="size-5" />,
  x: <X className="size-5" />,
  info: <Info className="size-5" />,
  list: <List className="size-5" />,
  'check-circle-2': <CheckCircle2 className="size-5" />,
  pencil: <Pencil className="size-5" />,
  calendar: <Calendar className="size-5" />,
  'line-chart': <LineChart className="size-5" />,
  activity: <Activity className="size-5" />,
  'kanban-square': <KanbanSquare className="size-5" />,
  rocket: <Rocket className="size-5" />,
  'clipboard-list': <ClipboardList className="size-5" />,
  flame: <Flame className="size-5" />,
  'help-circle': <HelpCircle className="size-5" />,
  check: <Check className="size-5" />,
  'alert-triangle': <AlertTriangle className="size-5" />,
  quote: <Quote className="size-5" />,
}

export function CalloutWrapper({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'blockquote'>) {
  const text = extractText(children).trim()
  const calloutMatch = MDX_REGEX.calloutPrefix.exec(text)

  if (calloutMatch) {
    const type = calloutMatch[1].toLowerCase()
    const customTitle = calloutMatch[2].trim()
    const title = customTitle || type

    const config = CALLOUT_CONFIG[type] ?? CALLOUT_CONFIG.note
    const styleData = COLOR_STYLES[config.color]
    const processedChildren = stripCalloutPrefix(children)
    const IconComponent = ICON_MAP[config.iconName]

    return (
      <div
        className={cn(
          'not-typeset my-5 flex gap-3 rounded-r-xl border-l-4 p-4',
          styleData.container,
        )}
      >
        <span className={cn('mt-0.5 shrink-0 text-base leading-none', styleData.icon)} aria-hidden>
          {IconComponent}
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest opacity-80">{title}</p>
          <div className="m-0 text-sm leading-relaxed sm:text-base">{processedChildren}</div>
        </div>
      </div>
    )
  }

  return <blockquote {...props}>{children}</blockquote>
}
