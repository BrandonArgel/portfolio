import { TextSelection } from '@tiptap/pm/state'
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
import { useEffect, useRef, useState } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CALLOUT_TYPES, type CalloutType, getCalloutTitle, isCalloutType } from '../config/callout'

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
  const { node, selected, deleteNode, updateAttributes, editor, getPos } = props
  const t = useTranslations('features.editor.callout')
  const tActions = useTranslations('common.actions')

  const inputRef = useRef<HTMLInputElement>(null)

  const [localTitle, setLocalTitle] = useState(
    typeof node.attrs.title === 'string' ? node.attrs.title : '',
  )

  const rawType = typeof node.attrs.type === 'string' ? node.attrs.type : 'info'

  const currentType = isCalloutType(rawType) ? rawType : 'info'

  const config = CALLOUT_CONFIG[currentType]

  useEffect(() => {
    setLocalTitle(typeof node.attrs.title === 'string' ? node.attrs.title : '')
  }, [node.attrs.title])

  const focusBeforeCallout = () => {
    const pos = getPos()

    if (typeof pos !== 'number') {
      return
    }

    const tr = editor.state.tr
    const resolvedPos = tr.doc.resolve(pos)

    const selection = TextSelection.findFrom(resolvedPos, -1, true)

    if (!selection) {
      return
    }

    editor.view.dispatch(tr.setSelection(selection))

    editor.view.focus()
  }

  const _focusAfterCallout = () => {
    const pos = getPos()

    if (typeof pos !== 'number') {
      return
    }

    editor
      .chain()
      .focus()
      .setTextSelection(pos + node.nodeSize)
      .run()
  }

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value

    setLocalTitle(title)

    updateAttributes({
      title,
    })
  }

  const handleTypeChange = (type: CalloutType) => {
    const title = localTitle.trim() || getCalloutTitle(type)

    setLocalTitle(title)

    updateAttributes({
      type,
      title,
    })
  }

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current

    if (!input) return

    const atStart = input.selectionStart === 0
    const atEnd = input.selectionStart === input.value.length

    if (event.key === 'ArrowLeft' && atStart) {
      event.preventDefault()
      event.stopPropagation()

      focusBeforeCallout()
      return
    }

    if (
      (event.key === 'ArrowRight' && atEnd) ||
      event.key === 'Enter' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault()
      event.stopPropagation()

      // focusFirstBlock()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()

      focusBeforeCallout()
    }
  }

  return (
    <NodeViewWrapper className={cn('group relative rounded-xl')}>
      {selected && (
        <button
          type="button"
          contentEditable={false}
          aria-label={tActions('delete')}
          className="absolute right-2 top-2 z-20 rounded-md p-1.5 hover:bg-destructive/10 hover:text-destructive"
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          onClick={() => deleteNode()}
        >
          <Trash2 className="size-4" />
        </button>
      )}
      <div
        className="absolute -top-10 right-0 z-10 hidden pb-1 group-hover:block"
        contentEditable={false}
      >
        <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm">
          {CALLOUT_TYPES.map((type) => {
            const value = CALLOUT_CONFIG[type]

            return (
              <Tooltip key={type}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      contentEditable={false}
                      aria-label={t(`type.${type}`)}
                      onMouseDown={(event) => {
                        event.preventDefault()
                      }}
                      onClick={() => handleTypeChange(type)}
                      className="cursor-pointer rounded-sm p-1 hover:bg-muted"
                    >
                      {value.icon}
                    </button>
                  }
                />

                <TooltipContent>{t(`type.${type}`)}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>

      <div
        className={cn('not-typeset my-5 flex gap-3 rounded-r-xl border-l-4 p-4', config.container)}
      >
        <div className="shrink-0 pt-0.5" contentEditable={false} aria-hidden="true">
          {config.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center" contentEditable={false}>
            <input
              ref={inputRef}
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              className="w-full border-none bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest opacity-80 outline-none placeholder:text-current/50"
              placeholder={t('title')}
              aria-label={t('title')}
            />
          </div>

          <NodeViewContent className="space-y-3 outline-none" />
        </div>
      </div>
    </NodeViewWrapper>
  )
}
