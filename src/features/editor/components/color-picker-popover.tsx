'use client'

import type { Editor } from '@tiptap/react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  EDITOR_COLOR_MAP,
  EDITOR_COLORS,
  type EditorColorOption,
  loadRecentColors,
  pushRecentColor,
  type RecentColorItem,
} from '../config/colors'

interface ColorPickerPopoverProps {
  editor: Editor
  activeTextColor: string | null
  activeHighlightColor: string | null
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(option)}
            className={cn(
              'flex size-7 cursor-pointer items-center justify-center rounded-md border border-border/80 bg-background text-sm font-bold transition-all hover:scale-105 hover:border-foreground/40 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isActive && 'border-primary ring-2 ring-primary/40',
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(option)}
            className={cn(
              'relative flex size-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border/80 transition-all hover:scale-105 hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              isDefault && 'bg-background',
              isActive && 'border-primary ring-2 ring-primary/40',
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
}: ColorPickerPopoverProps) {
  const t = useTranslations('features.editor.bubble_menu')
  const [open, setOpen] = useState(false)
  const [recentColors, setRecentColors] = useState<RecentColorItem[]>([])

  useEffect(() => {
    setRecentColors(loadRecentColors())
  }, [])

  const handleSelectTextColor = (option: EditorColorOption) => {
    if (option.textValue === null) {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(option.textValue).run()
    }
    setRecentColors((prev) => pushRecentColor(prev, { type: 'text', id: option.id }))
    setOpen(false)
  }

  const handleSelectHighlightColor = (option: EditorColorOption) => {
    if (option.bgValue === null) {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().setHighlight({ color: option.bgValue }).run()
    }
    setRecentColors((prev) => pushRecentColor(prev, { type: 'highlight', id: option.id }))
    setOpen(false)
  }

  const isTextColorActive = (option: EditorColorOption) => {
    if (option.id === 'default') return !activeTextColor
    return activeTextColor === option.textValue
  }

  const isHighlightColorActive = (option: EditorColorOption) => {
    if (option.id === 'default') return !activeHighlightColor
    return activeHighlightColor === option.bgValue
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
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    'h-8 gap-1 rounded-lg px-2 text-sm font-medium hover:bg-muted hover:text-foreground',
                    (activeTextColor || activeHighlightColor) && 'bg-muted/60',
                  )}
                >
                  <span
                    className="flex size-5 flex-col items-center justify-center rounded-sm px-1 leading-none font-bold transition-colors"
                    style={{
                      color: activeTextColor || 'var(--color-foreground)',
                      backgroundColor: activeHighlightColor || 'transparent',
                    }}
                  >
                    <span className="text-xs leading-none">A</span>
                    <span
                      className="mt-0.5 h-0.5 w-3 rounded-full"
                      style={{
                        backgroundColor: activeTextColor || 'var(--color-foreground)',
                      }}
                    />
                  </span>
                </Button>
              }
            />
          }
        />
        <TooltipContent sideOffset={8}>
          <span className="text-xs font-medium">{t('color')}</span>
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
