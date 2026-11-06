'use client'

import { CloudUpload, Eye, PanelRightClose, PanelRightOpen, PenLine, Send } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shortcut } from '@/components/ui/shortcut'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { useMounted } from '@/hooks/use-mounted'
import { cn } from '@/lib/utils'

const PREVIEW_SHORTCUT = 'mod+shift+p'

export interface EditorHeaderProps {
  title: string
  onTitleChange: (title: string) => void
  published: boolean
  draft: boolean
  lastUpdatedAt?: Date | number | string | null
  editorDisplayName: string
  isSaving: boolean
  isAutoSaving?: boolean
  isMetadataOpen?: boolean
  isPreviewMode?: boolean
  onPublish: () => void
  onPreview?: () => void
  onToggleMetadata: () => void
}

export function EditorHeader({
  title,
  onTitleChange,
  published,
  draft,
  lastUpdatedAt,
  editorDisplayName,
  isSaving,
  isAutoSaving = false,
  isMetadataOpen = false,
  isPreviewMode = false,
  onPublish,
  onPreview,
  onToggleMetadata,
}: EditorHeaderProps) {
  const t = useTranslations('features.blog.composer')
  const format = useFormatter()
  const isMounted = useMounted()

  useKeyboardShortcut(
    PREVIEW_SHORTCUT,
    () => {
      onPreview?.()
    },
    {
      ignoreInInputs: false,
      enabled: Boolean(onPreview),
    },
  )

  const statusConfig = (() => {
    if (published && draft) {
      return {
        label: t('status.unpublished_changes'),
        variant: 'softOrange' as const,
        dotClass: 'bg-orange-500',
      }
    }
    if (published && !draft) {
      return {
        label: t('status.published'),
        variant: 'softGreen' as const,
        dotClass: 'bg-emerald-500',
      }
    }
    return {
      label: t('status.draft'),
      variant: 'softYellow' as const,
      dotClass: 'bg-amber-500',
    }
  })()

  const formattedTimestamp = (() => {
    if (!isMounted || !lastUpdatedAt) {
      return t('header.just_now')
    }

    const parsedDate = lastUpdatedAt instanceof Date ? lastUpdatedAt : new Date(lastUpdatedAt)

    if (Number.isNaN(parsedDate.getTime())) {
      return t('header.just_now')
    }

    return format.dateTime(parsedDate, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  })()

  const publishButtonLabel = (() => {
    if (isSaving) return t('saving')
    if (published && draft) return t('header.publish_changes')
    if (published && !draft) return t('header.update')
    return t('header.publish')
  })()

  return (
    <header className="bg-secondary-background px-4 py-3 sm:px-6 flex items-center justify-between gap-4 border-b border-border shrink-0">
      {/* Left Section: Title, Status Badge & Audit Metadata */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <Input
            placeholder={t('frontmatter.title_placeholder')}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            aria-label={t('frontmatter.field_title')}
            className="h-8 w-full max-w-xl border-none bg-transparent dark:bg-transparent px-0 text-lg sm:text-xl font-bold tracking-tight text-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 truncate"
          />
          <Badge variant={statusConfig.variant} className="shrink-0 gap-1.5 px-2.5 py-0.5">
            <span className={`size-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>
            {t('header.last_updated', {
              timestamp: formattedTimestamp,
            })}
          </span>
          <span aria-hidden="true">•</span>
          <span>
            {t('header.by_author', {
              name: editorDisplayName,
            })}
          </span>
          {isAutoSaving && (
            <>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1 text-primary font-medium">
                <CloudUpload className="size-3 animate-pulse" />
                {t('header.syncing_draft')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Section: Action Bar */}
      <div className="flex items-center gap-2 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onPreview}
                  aria-pressed={isPreviewMode}
                  className={cn(
                    'gap-1.5',
                    isPreviewMode && 'bg-accent text-accent-foreground border-primary/30',
                  )}
                />
              }
            >
              {isPreviewMode ? <PenLine className="size-3.5" /> : <Eye className="size-3.5" />}
              <span className="hidden sm:inline">
                {isPreviewMode ? t('header.back_to_edit') : t('header.preview')}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>{isPreviewMode ? t('header.back_to_edit') : t('header.preview')}</span>
              <Shortcut keys={PREVIEW_SHORTCUT} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button type="button" size="sm" onClick={onPublish} disabled={isSaving} className="gap-1.5">
          {isSaving ? <Spinner className="size-3.5" /> : <Send className="size-3.5" />}
          <span>{publishButtonLabel}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onToggleMetadata}
          aria-label={t('frontmatter.title')}
          aria-expanded={isMetadataOpen}
          title={t('frontmatter.title')}
          className={cn(isMetadataOpen && 'bg-accent text-accent-foreground')}
        >
          {isMetadataOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </Button>
      </div>
    </header>
  )
}
