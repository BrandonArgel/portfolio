'use client'

import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useId, useMemo } from 'react'

import { LanguageIcon } from '@/components/shared/language-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  cycleLineAnnotation,
  formatLineRanges,
  getLineAnnotationMap,
  inferLanguageFromFilename,
  type LineAnnotationKind,
  normalizeStartLine,
  parseLineRanges,
} from '@/lib/code-block-meta'
import { cn } from '@/lib/utils'

interface CodeLanguageOption {
  label: string
  value: string
}

const GUTTER_STATE_CLASSES: Record<Exclude<LineAnnotationKind, 'normal'>, string> = {
  highlight: 'th-editor-gutter-line--highlighted',
  add: 'th-editor-gutter-line--inserted',
  remove: 'th-editor-gutter-line--deleted',
}

const ROW_STATE_CLASSES: Record<Exclude<LineAnnotationKind, 'normal'>, string> = {
  highlight: 'th-editor-row--highlighted',
  add: 'th-editor-row--inserted',
  remove: 'th-editor-row--deleted',
}

function stopPropagation(event: React.SyntheticEvent) {
  event.stopPropagation()
}

const STOP_EDITOR_PROPAGATION = {
  onMouseDown: stopPropagation,
  onPointerDown: stopPropagation,
  onClick: stopPropagation,
  onKeyDown: stopPropagation,
} as const

export function CodeBlockComponent({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const t = useTranslations('features.editor')
  const lineNumbersId = useId()
  const startLineId = useId()
  const highlightId = useId()
  const addId = useId()
  const removeId = useId()

  const currentLanguage = typeof node.attrs.language === 'string' ? node.attrs.language : ''
  const title = typeof node.attrs.title === 'string' ? node.attrs.title : ''
  const highlight = typeof node.attrs.highlight === 'string' ? node.attrs.highlight : ''
  const add = typeof node.attrs.add === 'string' ? node.attrs.add : ''
  const remove = typeof node.attrs.remove === 'string' ? node.attrs.remove : ''
  const startLine = normalizeStartLine(node.attrs.startLine)
  const showLineNumbers = node.attrs.lineNumbers !== false

  const lineCount = Math.max(1, node.textContent.split('\n').length)

  const annotationMap = useMemo(
    () => getLineAnnotationMap({ highlight, add, remove }),
    [add, highlight, remove],
  )

  const hasCustomOptions = Boolean(highlight || add || remove || startLine > 1 || !showLineNumbers)
  const hasAnnotations = Boolean(highlight || add || remove)

  const codeLanguages = useMemo<readonly CodeLanguageOption[]>(
    () => [
      { label: t('code_block.auto'), value: '' },
      { label: 'TypeScript', value: 'typescript' },
      { label: 'JavaScript', value: 'javascript' },
      { label: 'TSX', value: 'tsx' },
      { label: 'JSX', value: 'jsx' },
      { label: 'Python', value: 'python' },
      { label: 'HTML', value: 'html' },
      { label: 'CSS', value: 'css' },
      { label: 'JSON', value: 'json' },
      { label: 'Markdown', value: 'markdown' },
      { label: 'Bash / Shell', value: 'bash' },
      { label: 'SQL', value: 'sql' },
      { label: 'Rust', value: 'rust' },
      { label: 'Go', value: 'go' },
      { label: 'C++', value: 'cpp' },
      { label: 'C#', value: 'csharp' },
      { label: 'Java', value: 'java' },
      { label: 'YAML', value: 'yaml' },
      { label: 'TOML', value: 'toml' },
      { label: 'Docker', value: 'dockerfile' },
    ],
    [t],
  )

  const displayLanguageBadge = currentLanguage || 'text'

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value
    const inferred = inferLanguageFromFilename(nextTitle)

    if (inferred) {
      updateAttributes({ title: nextTitle, language: inferred })
    } else {
      updateAttributes({ title: nextTitle })
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    updateAttributes({ language: newLanguage })
  }

  const handleCycleLine = (relativeLine: number) => {
    if (!editor.isEditable) return
    updateAttributes(cycleLineAnnotation(relativeLine, { highlight, add, remove }))
  }

  const normalizeAnnotationAttr = (attr: 'highlight' | 'add' | 'remove', value: string) => {
    updateAttributes({ [attr]: formatLineRanges(parseLineRanges(value)) })
  }

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!editor.isEditable) return
    deleteNode()
  }

  return (
    <NodeViewWrapper
      className="not-typeset group relative my-5 overflow-hidden rounded-xl border border-code-border bg-code-bg shadow-xs"
      data-type="code-block"
    >
      <div
        role="toolbar"
        aria-label={t('code_block.actions')}
        contentEditable={false}
        className="flex items-center justify-between gap-2 border-b border-code-border bg-code-header px-3 py-1.5 select-none"
        {...STOP_EDITOR_PROPAGATION}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <LanguageIcon
            language={currentLanguage || 'text'}
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            readOnly={!editor.isEditable}
            placeholder={t('code_block.filename_placeholder')}
            aria-label={t('code_block.filename_label')}
            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/55 focus:outline-none"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        disabled={!editor.isEditable}
                        className="flex cursor-pointer items-center gap-1 rounded-md border border-border/50 bg-background/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-default disabled:opacity-70"
                        aria-label={t('code_block.select_language')}
                      >
                        <span>{displayLanguageBadge}</span>
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </button>
                    }
                  />
                }
              />
              <TooltipContent sideOffset={6}>{t('code_block.select_language')}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="max-h-64 w-44 overflow-y-auto">
              {codeLanguages.map((lang) => {
                const isSelected =
                  lang.value.toLowerCase() === currentLanguage.toLowerCase() ||
                  (!currentLanguage && lang.value === '')

                return (
                  <DropdownMenuItem
                    key={lang.value || 'auto'}
                    onClick={() => handleLanguageChange(lang.value)}
                    className="flex cursor-pointer items-center gap-2 font-mono text-xs"
                  >
                    <LanguageIcon language={lang.value} className="size-3.5 shrink-0" />
                    <span className="flex-1">{lang.label}</span>
                    {isSelected && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        disabled={!editor.isEditable}
                        aria-label={t('code_block.options')}
                        className={cn(
                          'relative flex cursor-pointer items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-default disabled:opacity-50',
                          hasCustomOptions && 'text-foreground',
                        )}
                      >
                        <SlidersHorizontal className="size-3.5" />
                        {hasCustomOptions && (
                          <span
                            aria-hidden="true"
                            className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    }
                  />
                }
              />
              <TooltipContent sideOffset={6}>{t('code_block.options')}</TooltipContent>
            </Tooltip>
            <PopoverContent align="end" className="w-72 p-3" {...STOP_EDITOR_PROPAGATION}>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={lineNumbersId} className="text-xs font-medium">
                    {t('code_block.line_numbers')}
                  </Label>
                  <Switch
                    id={lineNumbersId}
                    size="sm"
                    checked={showLineNumbers}
                    onCheckedChange={(checked) => updateAttributes({ lineNumbers: checked })}
                  />
                </div>

                <div className="grid grid-cols-[1fr_5rem] items-center gap-2">
                  <Label htmlFor={startLineId} className="text-xs text-muted-foreground">
                    {t('code_block.start_line')}
                  </Label>
                  <Input
                    id={startLineId}
                    type="number"
                    min={1}
                    value={startLine}
                    onChange={(e) =>
                      updateAttributes({ startLine: normalizeStartLine(e.target.value) })
                    }
                    className="h-7 px-2 font-mono text-xs"
                  />
                </div>

                <div className="space-y-2 border-t border-border/60 pt-2.5">
                  <div className="space-y-1">
                    <Label htmlFor={highlightId} className="text-xs text-muted-foreground">
                      {t('code_block.highlight_lines')}
                    </Label>
                    <Input
                      id={highlightId}
                      value={highlight}
                      placeholder={t('code_block.line_range_placeholder')}
                      onChange={(e) => updateAttributes({ highlight: e.target.value })}
                      onBlur={(e) => normalizeAnnotationAttr('highlight', e.target.value)}
                      className="h-7 px-2 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor={addId}
                      className="text-xs text-emerald-600 dark:text-emerald-400"
                    >
                      {t('code_block.added_lines')}
                    </Label>
                    <Input
                      id={addId}
                      value={add}
                      placeholder={t('code_block.line_range_placeholder')}
                      onChange={(e) => updateAttributes({ add: e.target.value })}
                      onBlur={(e) => normalizeAnnotationAttr('add', e.target.value)}
                      className="h-7 px-2 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={removeId} className="text-xs text-red-600 dark:text-red-400">
                      {t('code_block.removed_lines')}
                    </Label>
                    <Input
                      id={removeId}
                      value={remove}
                      placeholder={t('code_block.line_range_placeholder')}
                      onChange={(e) => updateAttributes({ remove: e.target.value })}
                      onBlur={(e) => normalizeAnnotationAttr('remove', e.target.value)}
                      className="h-7 px-2 font-mono text-xs"
                    />
                  </div>
                </div>

                {hasAnnotations && (
                  <button
                    type="button"
                    onClick={() => updateAttributes({ highlight: '', add: '', remove: '' })}
                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <RotateCcw className="size-3" />
                    <span>{t('code_block.clear_annotations')}</span>
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  disabled={!editor.isEditable}
                  onMouseDown={stopPropagation}
                  onPointerDown={stopPropagation}
                  onClick={handleDelete}
                  aria-label={t('code_block.delete')}
                  className="flex cursor-pointer items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-default disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              }
            />
            <TooltipContent sideOffset={6}>{t('code_block.delete')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <pre
        className="th-code flex p-0 font-mono text-sm leading-[1.625]"
        data-language={currentLanguage || 'plaintext'}
      >
        {showLineNumbers && (
          <div
            contentEditable={false}
            className="th-editor-gutter flex shrink-0 flex-col bg-code-bg py-4 font-mono text-sm leading-[1.625] select-none"
          >
            {Array.from({ length: lineCount }, (_, index) => {
              const relativeLine = index + 1
              const displayedLine = startLine + index
              const state = annotationMap.get(relativeLine)
              const sign = state === 'add' ? '+' : state === 'remove' ? '-' : ''

              return (
                <Tooltip key={relativeLine}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        disabled={!editor.isEditable}
                        aria-label={t('code_block.cycle_line_state')}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCycleLine(relativeLine)
                        }}
                        className={cn(
                          'flex h-[1.625em] w-full items-center justify-end gap-0.5 px-2.5 text-right opacity-65 transition-colors hover:bg-muted/60 hover:opacity-100',
                          editor.isEditable ? 'cursor-pointer' : 'cursor-default',
                          state && GUTTER_STATE_CLASSES[state],
                        )}
                      >
                        {sign && <span className="w-2.5 text-center font-semibold">{sign}</span>}
                        <span>{displayedLine}</span>
                      </button>
                    }
                  />
                  <TooltipContent side="left" sideOffset={6}>
                    {t('code_block.cycle_line_state')}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}

        <div className="relative min-w-0 flex-1 overflow-x-auto">
          <div className="relative min-w-full w-max py-4 whitespace-pre">
            <div
              aria-hidden="true"
              contentEditable={false}
              className="pointer-events-none absolute inset-x-0 top-4 bottom-4 z-0 flex flex-col"
            >
              {Array.from({ length: lineCount }, (_, index) => {
                const state = annotationMap.get(index + 1)
                return (
                  <div
                    key={index + 1}
                    className={cn('h-[1.625em] w-full', state && ROW_STATE_CLASSES[state])}
                  />
                )
              })}
            </div>

            <NodeViewContent
              className={cn(
                'relative z-10 block px-4 font-mono text-sm leading-[1.625] whitespace-pre outline-none',
                currentLanguage ? `language-${currentLanguage}` : undefined,
              )}
            />
          </div>
        </div>
      </pre>
    </NodeViewWrapper>
  )
}
