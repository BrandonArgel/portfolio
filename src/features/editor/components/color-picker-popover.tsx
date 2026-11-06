'use client'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { Baseline } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Shortcut } from '@/components/ui/shortcut'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { cn } from '@/lib/utils'

import {
  EDITOR_COLOR_MAP,
  EDITOR_COLORS,
  type EditorColorId,
  type EditorColorOption,
  getActiveMarkColor,
  loadRecentColors,
  normalizeEditorColor,
  pushRecentColor,
  type RecentColorItem,
} from '../config/colors'

interface ColorPickerPopoverProps {
  editor: Editor
  activeTextColor?: string | null
  activeHighlightColor?: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  shortcutKey?: string
  shortcutEnabled?: boolean
}

interface SectionHeaderProps {
  label: string
}

function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="w-fit cursor-default px-0.5 text-[11px] font-medium text-muted-foreground select-none">
            {label}
          </span>
        }
      />
      <TooltipContent side="top" sideOffset={6}>
        <span className="text-xs font-medium">{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}

interface TextColorSwatchProps {
  option: EditorColorOption
  label: string
  isActive: boolean
  onSelect: (option: EditorColorOption) => void
}

function TextColorSwatch({ option, label, isActive, onSelect }: TextColorSwatchProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            data-active={isActive || undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(option)}
            className={cn(
              'flex size-7 cursor-pointer items-center justify-center rounded-md border border-border/80 bg-background text-sm font-bold transition-all hover:scale-105 hover:border-foreground/40 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive && 'border-primary bg-accent/30 ring-2 ring-primary/50',
            )}
            style={{ color: option.previewText }}
          >
            A
          </button>
        }
      />
      <TooltipContent side="top" sideOffset={6}>
        <span className="text-xs font-medium">{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}

interface BackgroundColorSwatchProps {
  option: EditorColorOption
  label: string
  isActive: boolean
  onSelect: (option: EditorColorOption) => void
}

function BackgroundColorSwatch({ option, label, isActive, onSelect }: BackgroundColorSwatchProps) {
  const isDefault = option.id === 'default'

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            data-active={isActive || undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(option)}
            className={cn(
              'relative flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border/80 transition-all hover:scale-105 hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isDefault && 'bg-background',
              isActive && 'border-primary ring-2 ring-primary/50',
            )}
            style={!isDefault ? { backgroundColor: option.previewBg } : undefined}
          />
        }
      />
      <TooltipContent side="top" sideOffset={6}>
        <span className="text-xs font-medium">{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export function ColorPickerPopover({
  editor,
  activeTextColor,
  activeHighlightColor,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  shortcutKey,
  shortcutEnabled = false,
}: ColorPickerPopoverProps) {
  const t = useTranslations('features.editor.bubble_menu')
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [recentColors, setRecentColors] = useState<RecentColorItem[]>([])

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen
  const editorColorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      const activeTextMarks = {} as Record<EditorColorId, boolean>
      const activeHighlightMarks = {} as Record<EditorColorId, boolean>

      for (const option of EDITOR_COLORS) {
        activeTextMarks[option.id] = option.textValue
          ? editor.isActive('textStyle', { color: option.textValue })
          : false
        activeHighlightMarks[option.id] = option.bgValue
          ? editor.isActive('highlight', { color: option.bgValue })
          : false
      }

      return {
        activeTextColor: getActiveMarkColor(editor, 'textStyle', 'text'),
        activeHighlightColor: getActiveMarkColor(editor, 'highlight', 'highlight'),
        activeTextMarks,
        activeHighlightMarks,
      }
    },
  })

  const resolvedTextColor =
    editorColorState.activeTextColor ?? normalizeEditorColor(activeTextColor, 'text')
  const resolvedHighlightColor =
    editorColorState.activeHighlightColor ?? normalizeEditorColor(activeHighlightColor, 'highlight')
  const hasActiveColor = Boolean(resolvedTextColor || resolvedHighlightColor)

  useKeyboardShortcut(
    shortcutKey ?? '',
    () => {
      setOpen(!open)
    },
    {
      ignoreInInputs: false,
      enabled: Boolean(shortcutKey && shortcutEnabled),
    },
  )

  useEffect(() => {
    setRecentColors(loadRecentColors())
  }, [])

  const isTextColorActive = (option: EditorColorOption) => {
    if (option.id === 'default') return !resolvedTextColor
    return (
      resolvedTextColor === option.textValue || Boolean(editorColorState.activeTextMarks[option.id])
    )
  }

  const isHighlightColorActive = (option: EditorColorOption) => {
    if (option.id === 'default') return !resolvedHighlightColor
    return (
      resolvedHighlightColor === option.bgValue ||
      Boolean(editorColorState.activeHighlightMarks[option.id])
    )
  }

  const handleSelectTextColor = (option: EditorColorOption) => {
    if (option.textValue === null || isTextColorActive(option)) {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(option.textValue).run()
    }
    setRecentColors((prev) => pushRecentColor(prev, { type: 'text', id: option.id }))
    setOpen(false)
  }

  const handleSelectHighlightColor = (option: EditorColorOption) => {
    if (option.bgValue === null || isHighlightColorActive(option)) {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().setHighlight({ color: option.bgValue }).run()
    }
    setRecentColors((prev) => pushRecentColor(prev, { type: 'highlight', id: option.id }))
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={t('color')}
                  aria-pressed={hasActiveColor}
                  data-active={hasActiveColor || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    'h-8 gap-1 rounded-lg px-2 text-sm font-medium hover:bg-muted hover:text-foreground',
                    hasActiveColor && 'bg-muted text-foreground',
                  )}
                >
                  <span
                    className="flex size-5 items-center justify-center rounded-sm transition-colors"
                    style={{
                      color: resolvedTextColor ?? undefined,
                      backgroundColor: resolvedHighlightColor ?? undefined,
                    }}
                  >
                    <Baseline className="size-4" />
                  </span>
                </Button>
              }
            />
          }
        />
        <TooltipContent sideOffset={8} className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium">{t('color')}</span>
          {shortcutKey && <Shortcut keys={shortcutKey} />}
        </TooltipContent>
      </Tooltip>

      <PopoverContent align="center" sideOffset={8} className="w-52 gap-3 p-3">
        {recentColors.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <SectionHeader label={t('colors.recently_used')} />
            <div className="grid grid-cols-5 gap-1.5">
              {recentColors.map((item) => {
                const option = EDITOR_COLOR_MAP[item.id]
                const colorName = t(`colors.${option.id}`)

                if (item.type === 'text') {
                  return (
                    <TextColorSwatch
                      key={`recent-text-${option.id}`}
                      option={option}
                      label={colorName}
                      isActive={isTextColorActive(option)}
                      onSelect={handleSelectTextColor}
                    />
                  )
                }

                return (
                  <BackgroundColorSwatch
                    key={`recent-highlight-${option.id}`}
                    option={option}
                    label={colorName}
                    isActive={isHighlightColorActive(option)}
                    onSelect={handleSelectHighlightColor}
                  />
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <SectionHeader label={t('colors.text_color')} />
          <div className="grid grid-cols-5 gap-1.5">
            {EDITOR_COLORS.map((option) => (
              <TextColorSwatch
                key={`text-${option.id}`}
                option={option}
                label={t(`colors.${option.id}`)}
                isActive={isTextColorActive(option)}
                onSelect={handleSelectTextColor}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <SectionHeader label={t('colors.background_color')} />
          <div className="grid grid-cols-5 gap-1.5">
            {EDITOR_COLORS.map((option) => (
              <BackgroundColorSwatch
                key={`bg-${option.id}`}
                option={option}
                label={t(`colors.${option.id}`)}
                isActive={isHighlightColorActive(option)}
                onSelect={handleSelectHighlightColor}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
