'use client'

import { CornerDownLeft, Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { COMMENT_MAX_LENGTH } from '@/features/blog/schemas/comment.schema'
import type { CommentAuthor } from '@/features/blog/types'
import { useIsMac } from '@/hooks/use-is-mac'
import { cn } from '@/lib/utils'

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export interface CommentComposerProps {
  currentUser: CommentAuthor
  placeholder?: string
  submitLabel?: string
  initialValue?: string
  autoFocus?: boolean
  isReply?: boolean
  isPending?: boolean
  onSubmit: (content: string) => Promise<boolean> | boolean
  onCancel?: () => void
  className?: string
}

export function CommentComposer({
  currentUser,
  placeholder,
  submitLabel,
  initialValue = '',
  autoFocus = false,
  isReply = false,
  isPending = false,
  onSubmit,
  onCancel,
  className,
}: CommentComposerProps) {
  const t = useTranslations('features.blog.reader.comments')
  const isMac = useIsMac()
  const [content, setContent] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (initialValue) {
      setContent(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [autoFocus])

  const trimmedLength = content.trim().length
  const isOverLimit = content.length > COMMENT_MAX_LENGTH
  const canSubmit = trimmedLength > 0 && !isOverLimit

  async function handleFormSubmit() {
    const submittedText = content.trim()

    if (!submittedText || isOverLimit) {
      if (!submittedText) {
        sileo.error({ title: t('notifications.empty_error') })
      }
      return
    }

    // Immediately clear the composer before awaiting the server action
    setContent('')

    try {
      const ok = await onSubmit(submittedText)
      if (!ok) {
        // Rollback user's draft if the server action failed
        setContent((current) => (current.trim().length > 0 ? current : submittedText))
      }
    } catch {
      setContent((current) => (current.trim().length > 0 ? current : submittedText))
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleFormSubmit()
    } else if (e.key === 'Escape' && onCancel) {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-border/70 bg-card/50 p-3.5 shadow-2xs transition-colors focus-within:border-ring/60 focus-within:bg-card',
        isReply && 'mt-3 bg-muted/20 p-3',
        className,
      )}
    >
      <Avatar size={isReply ? 'sm' : 'default'} className="mt-0.5 shrink-0">
        {currentUser.image && <AvatarImage src={currentUser.image} alt={currentUser.name} />}
        <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('placeholder')}
          maxLength={COMMENT_MAX_LENGTH + 50}
          aria-invalid={isOverLimit}
          className={cn(
            'min-h-20 resize-y border-0 bg-transparent px-1 py-0.5 shadow-none focus-visible:ring-0 dark:bg-transparent',
            isReply && 'min-h-16 text-sm',
          )}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={cn(
                'tabular-nums transition-colors',
                isOverLimit && 'font-medium text-destructive',
                !isOverLimit &&
                  content.length > COMMENT_MAX_LENGTH * 0.9 &&
                  'text-amber-600 dark:text-amber-400',
              )}
            >
              {content.length}/{COMMENT_MAX_LENGTH}
            </span>
            <span
              suppressHydrationWarning
              className="hidden items-center gap-1 text-muted-foreground/70 sm:inline-flex"
            >
              <CornerDownLeft className="size-3" />
              {t('shortcut_hint', { key: isMac ? '⌘' : 'Ctrl' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={() => void handleFormSubmit()}
              disabled={!canSubmit}
              className="gap-1.5"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span>{submitLabel ?? (isReply ? t('submit_reply') : t('submit'))}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
