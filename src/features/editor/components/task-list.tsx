'use client'

import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { ListChecks, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function TaskListComponent({ node, updateAttributes, editor }: NodeViewProps) {
  const t = useTranslations('features.editor.task_list')
  const interactive = Boolean(node.attrs.interactive)

  const handleToggle = () => {
    if (!editor.isEditable) return
    updateAttributes({ interactive: !interactive })
  }

  return (
    <NodeViewWrapper
      data-type="taskList"
      data-interactive={interactive ? 'true' : 'false'}
      className={cn(
        'not-typeset group/tasklist relative my-3 rounded-lg transition-colors',
        interactive && 'border border-primary/20 bg-primary/[0.03] px-3 py-2',
      )}
    >
      <div
        contentEditable={false}
        className={cn(
          'flex items-center justify-end select-none transition-opacity',
          interactive
            ? 'mb-1.5 opacity-100'
            : 'pointer-events-none absolute top-0.5 right-1 z-10 opacity-0 group-hover/tasklist:pointer-events-auto group-hover/tasklist:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100',
        )}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-pressed={interactive}
                aria-label={t('toggle_interactive')}
                onClick={handleToggle}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
                  interactive
                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
                    : 'border-border bg-background/90 text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {interactive ? <ListChecks className="size-3.5" /> : <Lock className="size-3.5" />}
                <span>{interactive ? t('interactive') : t('read_only')}</span>
              </button>
            }
          />
          <TooltipContent sideOffset={6}>{t('toggle_interactive')}</TooltipContent>
        </Tooltip>
      </div>

      <NodeViewContent className="m-0 p-0 [&>ul]:m-0 [&>ul]:list-none [&>ul]:p-0" />
    </NodeViewWrapper>
  )
}
