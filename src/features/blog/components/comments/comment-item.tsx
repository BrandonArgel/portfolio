'use client'

import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Loader2,
  MessageSquareReply,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type KeyboardEvent, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { COMMENT_MAX_LENGTH } from '@/features/blog/schemas/comment.schema'
import type { BlogComment, CommentAuthor } from '@/features/blog/types'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { CommentComposer, getInitials } from './comment-composer'
import { RelativeTime } from './relative-time'

const AUTO_COLLAPSE_REPLY_THRESHOLD = 3
const MAX_INDENT_DEPTH = 3

export interface CommentItemProps {
  comment: BlogComment
  postAuthorId: string
  loginHref: string
  currentUser: CommentAuthor | null
  depth?: number
  activeReplyId: string | null
  activeEditId: string | null
  isMutating?: boolean
  onToggleReply: (commentId: string | null) => void
  onToggleEdit: (commentId: string | null) => void
  onCreateReply: (parentId: string, content: string) => Promise<boolean>
  onUpdateComment: (commentId: string, content: string) => Promise<boolean>
  onDeleteComment: (commentId: string) => Promise<boolean>
}

export function CommentItem({
  comment,
  postAuthorId,
  loginHref,
  currentUser,
  depth = 0,
  activeReplyId,
  activeEditId,
  isMutating = false,
  onToggleReply,
  onToggleEdit,
  onCreateReply,
  onUpdateComment,
  onDeleteComment,
}: CommentItemProps) {
  const t = useTranslations('features.blog.reader.comments')
  const router = useRouter()

  const repliesCount = comment.replies.length
  const [isRepliesCollapsed, setIsRepliesCollapsed] = useState<boolean>(
    repliesCount > AUTO_COLLAPSE_REPLY_THRESHOLD,
  )
  const [editContent, setEditContent] = useState<string>(comment.content)
  const [failedReplyDraft, setFailedReplyDraft] = useState<string>('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [isSubmittingLocal, setIsSubmittingLocal] = useState<boolean>(false)

  const isReplying = activeReplyId === comment.id
  const isEditing = activeEditId === comment.id
  const isCommentAuthor = currentUser?.id === comment.authorId
  const isAdmin = currentUser?.role === 'admin'
  const canEdit = isCommentAuthor
  const canDelete = isCommentAuthor || isAdmin

  const isPostAuthor = comment.authorId === postAuthorId
  const isAuthorAdmin = comment.author.role === 'admin'

  const createdAtDate =
    comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)
  const updatedAtDate =
    comment.updatedAt instanceof Date ? comment.updatedAt : new Date(comment.updatedAt)
  const isEdited = updatedAtDate.getTime() - createdAtDate.getTime() > 1000

  function handleReplyButtonClick() {
    if (!currentUser) {
      router.push(loginHref)
      return
    }
    onToggleReply(isReplying ? null : comment.id)
  }

  function handleStartEdit() {
    setEditContent(comment.content)
    onToggleEdit(comment.id)
  }

  async function handleSaveEdit() {
    const trimmed = editContent.trim()
    if (!trimmed || trimmed.length > COMMENT_MAX_LENGTH || isSubmittingLocal) {
      return
    }
    if (trimmed === comment.content.trim()) {
      onToggleEdit(null)
      return
    }

    // Immediately close edit mode while optimistic update runs
    onToggleEdit(null)
    setIsSubmittingLocal(true)
    try {
      const ok = await onUpdateComment(comment.id, trimmed)
      if (!ok) {
        // Restore edit mode with user's draft if server action failed
        setEditContent(trimmed)
        onToggleEdit(comment.id)
      }
    } finally {
      setIsSubmittingLocal(false)
    }
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onToggleEdit(null)
    }
  }

  async function handleReplySubmit(content: string): Promise<boolean> {
    const submittedReply = content.trim()
    setFailedReplyDraft('')
    setIsRepliesCollapsed(false)
    // Immediately close the inline reply box so the optimistic reply is visible right away
    onToggleReply(null)

    setIsSubmittingLocal(true)
    try {
      const ok = await onCreateReply(comment.id, submittedReply)
      if (!ok) {
        // Re-open the reply box with the user's draft if the server action failed
        setFailedReplyDraft(submittedReply)
        onToggleReply(comment.id)
      }
      return ok
    } finally {
      setIsSubmittingLocal(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleteDialogOpen(false)
    setIsSubmittingLocal(true)
    try {
      await onDeleteComment(comment.id)
    } finally {
      setIsSubmittingLocal(false)
    }
  }

  const trimmedEditLen = editContent.trim().length
  const isEditOverLimit = editContent.length > COMMENT_MAX_LENGTH
  const canSaveEdit = trimmedEditLen > 0 && !isEditOverLimit && !isSubmittingLocal

  return (
    <div id={`comment-${comment.id}`} className="group/comment relative">
      <div className="flex gap-3 sm:gap-3.5">
        <Avatar size={depth > 0 ? 'sm' : 'default'} className="mt-0.5 shrink-0">
          {comment.author.image && (
            <AvatarImage src={comment.author.image} alt={comment.author.name} />
          )}
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          {/* Comment Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>

              {isPostAuthor && (
                <Badge variant="softPrimary" className="h-4.5 px-1.5 text-[11px]">
                  {t('badge_author')}
                </Badge>
              )}

              {isAuthorAdmin && !isPostAuthor && (
                <Badge variant="softPurple" className="h-4.5 px-1.5 text-[11px]">
                  {t('badge_admin')}
                </Badge>
              )}

              <span className="text-xs text-muted-foreground/50" aria-hidden="true">
                •
              </span>

              <RelativeTime date={createdAtDate} />

              {isEdited && (
                <span className="text-xs italic text-muted-foreground/75">{t('edited')}</span>
              )}
            </div>

            {(canEdit || canDelete) && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground opacity-70 transition-opacity hover:opacity-100 group-hover/comment:opacity-100"
                      aria-label={t('more_actions')}
                    />
                  }
                >
                  <MoreHorizontal className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-36">
                  {canEdit && (
                    <DropdownMenuItem onClick={handleStartEdit}>
                      <Pencil className="size-3.5" />
                      <span>{t('edit')}</span>
                    </DropdownMenuItem>
                  )}
                  {canEdit && canDelete && <DropdownMenuSeparator />}
                  {canDelete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="size-3.5" />
                      <span>{t('delete')}</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment Body or Inline Editor */}
          {isEditing ? (
            <div className="mt-2.5 flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3 shadow-2xs">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleEditKeyDown}
                placeholder={t('edit_placeholder')}
                disabled={isSubmittingLocal}
                autoFocus
                aria-invalid={isEditOverLimit}
                className="min-h-18 text-sm"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    'text-xs tabular-nums text-muted-foreground',
                    isEditOverLimit && 'font-medium text-destructive',
                  )}
                >
                  {editContent.length}/{COMMENT_MAX_LENGTH}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleEdit(null)}
                    disabled={isSubmittingLocal}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleSaveEdit()}
                    disabled={!canSaveEdit}
                    className="gap-1.5"
                  >
                    {isSubmittingLocal && <Loader2 className="size-3.5 animate-spin" />}
                    <span>{t('save')}</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
              {comment.content}
            </p>
          )}

          {/* Comment Action Bar */}
          {!isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleReplyButtonClick}
                className={cn(
                  '-ml-2 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground',
                  isReplying && 'bg-muted text-foreground',
                )}
              >
                <MessageSquareReply className="size-3.5" />
                <span>{t('reply')}</span>
              </Button>

              {repliesCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsRepliesCollapsed((prev) => !prev)}
                  className="gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {isRepliesCollapsed ? (
                    <>
                      <ChevronDown className="size-3.5" />
                      <span>{t('show_replies', { count: repliesCount })}</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="size-3.5" />
                      <span>{t('hide_replies', { count: repliesCount })}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Inline Reply Composer */}
          {isReplying && currentUser && (
            <CommentComposer
              currentUser={currentUser}
              placeholder={t('reply_placeholder', { name: comment.author.name })}
              submitLabel={t('submit_reply')}
              initialValue={failedReplyDraft}
              isReply
              autoFocus
              isPending={isSubmittingLocal || isMutating}
              onSubmit={handleReplySubmit}
              onCancel={() => {
                setFailedReplyDraft('')
                onToggleReply(null)
              }}
            />
          )}

          {/* Nested Replies Thread */}
          {repliesCount > 0 && !isRepliesCollapsed && (
            <div
              className={cn(
                'mt-4 space-y-5 border-l-2 border-border/60 pl-4 sm:pl-5',
                depth >= MAX_INDENT_DEPTH && 'border-l border-border/40 pl-2.5 sm:pl-3',
              )}
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postAuthorId={postAuthorId}
                  loginHref={loginHref}
                  currentUser={currentUser}
                  depth={depth + 1}
                  activeReplyId={activeReplyId}
                  activeEditId={activeEditId}
                  isMutating={isMutating}
                  onToggleReply={onToggleReply}
                  onToggleEdit={onToggleEdit}
                  onCreateReply={onCreateReply}
                  onUpdateComment={onUpdateComment}
                  onDeleteComment={onDeleteComment}
                />
              ))}
            </div>
          )}

          {repliesCount > 0 && isRepliesCollapsed && (
            <button
              type="button"
              onClick={() => setIsRepliesCollapsed(false)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <CornerDownRight className="size-3.5" />
              <span>{t('show_replies', { count: repliesCount })}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('delete_dialog.title')}</DialogTitle>
            <DialogDescription>{t('delete_dialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmittingLocal}
            >
              {t('delete_dialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isSubmittingLocal}
              className="gap-1.5"
            >
              {isSubmittingLocal ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>{t('delete_dialog.confirm')}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
