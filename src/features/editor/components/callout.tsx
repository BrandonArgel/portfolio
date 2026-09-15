import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import {
  AlertTriangle,
  Bug,
  Check,
  Flame,
  Info,
  List,
  Pencil,
  Quote,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { CALLOUT_TYPES, type CalloutType, isCalloutType } from '../config/callout'

const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    container: string
    icon: React.ReactNode
  }
> = {
  tip: {
    container: 'border-callout-cyan bg-callout-cyan/10 text-callout-cyan-text',
    icon: <Flame className="size-5 text-callout-cyan" />,
  },
  info: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Info className="size-5 text-callout-blue" />,
  },
  pencil: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Pencil className="size-5 text-callout-blue" />,
  },
  quote: {
    container: 'border-callout-blue bg-callout-blue/10 text-callout-blue-text',
    icon: <Quote className="size-5 text-callout-blue" />,
  },
  success: {
    container: 'border-callout-green bg-callout-green/10 text-callout-green-text',
    icon: <Check className="size-5 text-callout-green" />,
  },
  warning: {
    container: 'border-callout-yellow bg-callout-yellow/10 text-callout-yellow-text',
    icon: <AlertTriangle className="size-5 text-callout-yellow" />,
  },
  failure: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: <X className="size-5 text-callout-red" />,
  },
  danger: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: <Zap className="size-5 text-callout-red" />,
  },
  bug: {
    container: 'border-callout-red bg-callout-red/10 text-callout-red-text',
    icon: <Bug className="size-5 text-callout-red" />,
  },
  example: {
    container: 'border-callout-purple bg-callout-purple/10 text-callout-purple-text',
    icon: <List className="size-5 text-callout-purple" />,
  },
} as const

export function CalloutComponent(props: NodeViewProps) {
  const { node, deleteNode, updateAttributes } = props
  const t = useTranslations('features.editor.callout')
  const tActions = useTranslations('common.actions')

  const rawType = typeof node.attrs.type === 'string' ? node.attrs.type : 'info'
  const currentType = isCalloutType(rawType) ? rawType : 'info'
  const config = CALLOUT_CONFIG[currentType]

  const handleTypeChange = (type: CalloutType) => {
    updateAttributes({ type })
  }

  return (
    <NodeViewWrapper
      data-type="callout"
      className={cn('not-typeset group relative my-5 rounded-r-xl border-l-4', config.container)}
    >
      <div className="flex gap-3 p-4">
        <div contentEditable={false} className="shrink-0 pt-0.5" aria-hidden="true">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex size-6 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                  aria-label={t('change_type')}
                >
                  {config.icon}
                </button>
              }
            />

            <DropdownMenuContent align="start" className="w-48">
              {CALLOUT_TYPES.map((type) => {
                const typeConfig = CALLOUT_CONFIG[type]
                return (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <div className="shrink-0">{typeConfig.icon}</div>
                    <span className="capitalize">{t(`type.${type}`)}</span>
                  </DropdownMenuItem>
                )
              })}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={deleteNode}
                className="flex cursor-pointer items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="size-4" />
                <span>{tActions('delete')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <NodeViewContent
          className={cn(
            'not-draggable min-w-0 flex-1 outline-none [&>p]:my-0',
            '*:data-[type=callout-title]:text-sm',
            '*:data-[type=callout-title]:font-bold',
            '*:data-[type=callout-title]:uppercase',
            '*:data-[type=callout-title]:tracking-widest',
            '*:data-[type=callout-title]:opacity-80',
          )}
        />
      </div>
    </NodeViewWrapper>
  )
}
