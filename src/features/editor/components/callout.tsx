import { TextSelection } from '@tiptap/pm/state'
import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { AlertTriangle, Bug, Check, Flame, Info, List, Pencil, Quote, X, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const CALLOUT_CONFIG: Record<string, { container: string; icon: React.ReactNode }> = {
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
}

export function CalloutComponent(props: NodeViewProps) {
  const t = useTranslations('features.editor.callout')
  const { node, updateAttributes, editor, getPos } = props
  const [localTitle, setLocalTitle] = useState(node.attrs.title || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const currentType = node.attrs.type
  const config = CALLOUT_CONFIG[currentType] || CALLOUT_CONFIG.info

  useEffect(() => {
    setLocalTitle(node.attrs.title || '')
  }, [node.attrs.title])

  const changeType = (newType: string) => {
    if (!localTitle || localTitle.trim() === '') {
      const defaultTitle = newType.toUpperCase()
      setLocalTitle(defaultTitle)
      updateAttributes({ type: newType, title: defaultTitle })
    } else {
      updateAttributes({ type: newType })
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    setLocalTitle(newVal)
    updateAttributes({ title: newVal })
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isAtStart = inputRef.current?.selectionStart === 0
    const isAtEnd = inputRef.current?.selectionStart === localTitle.length

    const checkPos = () => {
      const pos = getPos()
      if (typeof pos === 'number') {
        const tr = editor.state.tr
        const resolvedPos = tr.doc.resolve(pos)
        const selection = TextSelection.findFrom(resolvedPos, -1, true)

        if (selection) {
          editor.view.dispatch(tr.setSelection(selection))
          editor.view.focus()
        }
      }
    }

    if (e.key === 'ArrowLeft' && isAtStart) {
      e.preventDefault()
      e.stopPropagation()
      checkPos()
      return
    }

    if (e.key === 'ArrowRight' && isAtEnd) {
      e.preventDefault()
      e.stopPropagation()
      const pos = getPos()
      if (typeof pos === 'number') {
        editor.commands.setTextSelection(pos + 1)
        editor.commands.focus()
      }
      return
    }

    const keysToStop = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', ' ', 'Home', 'End']
    if (keysToStop.includes(e.key)) {
      e.stopPropagation()
    }
    if (e.key === 'Enter' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      const pos = getPos()
      if (typeof pos === 'number') {
        editor.commands.setTextSelection(pos + 1)
        editor.commands.focus()
      }
    }

    if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault()
      checkPos()
    }
  }

  return (
    <NodeViewWrapper className="relative group">
      <div className="absolute -top-10 right-0 pb-1 hidden group-hover:block z-10 transition-opacity">
        <div className="flex items-center gap-1 bg-background border border-border shadow-sm rounded-md p-1">
          {Object.entries(CALLOUT_CONFIG).map(([key, value]) => (
            <Tooltip key={key}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => changeType(key)}
                    className="p-1 hover:bg-muted rounded-sm cursor-pointer"
                  >
                    {value.icon}
                  </button>
                }
              />
              <TooltipContent>{t(`type.${key}`)}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <div
        ref={contentRef}
        className={cn('not-typeset my-5 flex gap-3 rounded-r-xl border-l-4 p-4', config.container)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="shrink-0 text-base leading-none"
              aria-hidden="true"
              contentEditable={false}
            >
              {config.icon}
            </span>
            <div contentEditable={false} className="py-0 w-full">
              <input
                ref={inputRef}
                type="text"
                tabIndex={-1}
                value={localTitle}
                onChange={handleTitleChange}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent outline-none border-none p-0 text-[11px] font-bold uppercase tracking-widest opacity-80 placeholder:text-current/50"
                placeholder={t('title')}
              />
            </div>
          </div>
          <NodeViewContent className="m-0 text-sm leading-relaxed sm:text-base outline-none" />
        </div>
      </div>
    </NodeViewWrapper>
  )
}
