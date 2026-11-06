'use client'

import { LogIn, MessageSquare, MessagesSquare, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOptimistic, useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { LinkButton } from '@/components/ui/button'
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from '@/features/blog/actions/comment-actions'
import type { BlogComment, CommentAuthor } from '@/features/blog/types'
import { CommentComposer } from './comment-composer'
import { CommentItem } from './comment-item'

type OptimisticCommentAction =
  | { type: 'add'; comment: BlogComment }
  | { type: 'update'; commentId: string; content: string; updatedAt: Date }
  | { type: 'delete'; commentId: string }

const DUPLICATE_WINDOW_MS = 10_000

function isSameOrDuplicateComment(existing: BlogComment, candidate: BlogComment): boolean {
  if (existing.id === candidate.id) {
    return true
  }

  if (
    existing.authorId === candidate.authorId &&
    (existing.parentId ?? null) === (candidate.parentId ?? null) &&
    existing.content === candidate.content
  ) {
    const existingTime =
      existing.createdAt instanceof Date
        ? existing.createdAt.getTime()
        : new Date(existing.createdAt).getTime()
    const candidateTime =
      candidate.createdAt instanceof Date
        ? candidate.createdAt.getTime()
        : new Date(candidate.createdAt).getTime()

    if (Math.abs(existingTime - candidateTime) < DUPLICATE_WINDOW_MS) {
      return true
    }
  }

  return false
}

function insertCommentIntoTree(tree: BlogComment[], newComment: BlogComment): BlogComment[] {
  if (!newComment.parentId) {
    if (tree.some((node) => isSameOrDuplicateComment(node, newComment))) {
      return tree
    }
    return [...tree, newComment]
  }

  return tree.map((node) => {
    if (node.id === newComment.parentId) {
      if (node.replies.some((reply) => isSameOrDuplicateComment(reply, newComment))) {
        return node
      }
      return {
        ...node,
        replies: [...node.replies, newComment],
      }
    }
    if (node.replies.length > 0) {
      return {
        ...node,
        replies: insertCommentIntoTree(node.replies, newComment),
      }
    }
    return node
  })
}

function updateCommentInTree(
  tree: BlogComment[],
  commentId: string,
  content: string,
  updatedAt: Date,
): BlogComment[] {
  return tree.map((node) => {
    if (node.id === commentId) {
      return {
        ...node,
        content,
        updatedAt,
      }
    }
    if (node.replies.length > 0) {
      return {
        ...node,
        replies: updateCommentInTree(node.replies, commentId, content, updatedAt),
      }
    }
    return node
  })
}

function removeCommentFromTree(tree: BlogComment[], commentId: string): BlogComment[] {
  return tree
    .filter((node) => node.id !== commentId)
    .map((node) =>
      node.replies.length > 0
        ? {
            ...node,
            replies: removeCommentFromTree(node.replies, commentId),
          }
        : node,
    )
}

function countCommentsInTree(tree: BlogComment[]): number {
  let count = 0
  for (const node of tree) {
    count += 1 + countCommentsInTree(node.replies)
  }
  return count
}

export interface CommentsThreadClientProps {
  postId: string
  postAuthorId: string
  postSlug: string
  initialComments: BlogComment[]
  currentUser: CommentAuthor | null
}

export function CommentsThreadClient({
  postId,
  postAuthorId,
  postSlug,
  initialComments,
  currentUser,
}: CommentsThreadClientProps) {
  const t = useTranslations('features.blog.reader.comments')

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [activeEditId, setActiveEditId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticComments, dispatchOptimistic] = useOptimistic<
    BlogComment[],
    OptimisticCommentAction
  >(initialComments, (state, action) => {
    switch (action.type) {
      case 'add':
        return insertCommentIntoTree(state, action.comment)
      case 'update':
        return updateCommentInTree(state, action.commentId, action.content, action.updatedAt)
      case 'delete':
        return removeCommentFromTree(state, action.commentId)
    }
  })

  const totalCount = countCommentsInTree(optimisticComments)
  const callbackPath = `/blog/${postSlug}#comments`
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackPath)}`

  function handleToggleReply(commentId: string | null) {
    setActiveEditId(null)
    setActiveReplyId(commentId)
  }

  function handleToggleEdit(commentId: string | null) {
    setActiveReplyId(null)
    setActiveEditId(commentId)
  }

  async function handleCreateComment(
    content: string,
    parentId: string | null = null,
  ): Promise<boolean> {
    if (!currentUser) return false

    const clientId = crypto.randomUUID()
    const now = new Date()
    const optimisticComment: BlogComment = {
      id: clientId,
      content,
      postId,
      authorId: currentUser.id,
      parentId,
      createdAt: now,
      updatedAt: now,
      author: currentUser,
      replies: [],
    }

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        dispatchOptimistic({ type: 'add', comment: optimisticComment })

        const res = await createCommentAction({
          id: clientId,
          postId,
          parentId,
          content,
        })

        if (res?.data?.success && res.data.comment) {
          sileo.success({
            title: parentId ? t('notifications.reply_created') : t('notifications.created'),
          })
          resolve(true)
          return
        }

        sileo.error({
          title: res?.serverError?.title ?? t('notifications.error'),
          description: res?.serverError?.description,
        })
        resolve(false)
      })
    })
  }

  async function handleUpdateComment(commentId: string, content: string): Promise<boolean> {
    const now = new Date()

    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        dispatchOptimistic({
          type: 'update',
          commentId,
          content,
          updatedAt: now,
        })

        const res = await updateCommentAction({
          commentId,
          content,
        })

        if (res?.data?.success) {
          sileo.success({ title: t('notifications.updated') })
          resolve(true)
          return
        }

        sileo.error({
          title: res?.serverError?.title ?? t('notifications.error'),
          description: res?.serverError?.description,
        })
        resolve(false)
      })
    })
  }

  async function handleDeleteComment(commentId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        dispatchOptimistic({
          type: 'delete',
          commentId,
        })

        const res = await deleteCommentAction({ commentId })

        if (res?.data?.success) {
          sileo.success({ title: t('notifications.deleted') })
          resolve(true)
          return
        }

        sileo.error({
          title: res?.serverError?.title ?? t('notifications.error'),
          description: res?.serverError?.description,
        })
        resolve(false)
      })
    })
  }

  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      className="mt-16 scroll-mt-24 border-t border-border pt-12"
    >
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="size-4.5" />
          </div>
          <h2 id="comments-heading" className="text-2xl font-bold tracking-tight text-foreground">
            {t('count', { count: totalCount })}
          </h2>
        </div>
      </div>

      {/* Main Comment Composer or Sign-In Call to Action */}
      <div className="mb-10">
        {currentUser ? (
          <CommentComposer
            currentUser={currentUser}
            isPending={isPending && activeReplyId === null && activeEditId === null}
            onSubmit={(content) => handleCreateComment(content, null)}
          />
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">{t('sign_in_title')}</h3>
              <p className="text-sm text-muted-foreground">{t('sign_in_description')}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <LinkButton href={loginHref} size="sm" className="gap-1.5">
                <LogIn className="size-3.5" />
                <span>{t('sign_in_action')}</span>
              </LinkButton>
              <LinkButton href="/register" variant="outline" size="sm" className="gap-1.5">
                <UserPlus className="size-3.5" />
                <span>{t('create_account_action')}</span>
              </LinkButton>
            </div>
          </div>
        )}
      </div>

      {/* Comments Thread or Empty State */}
      {optimisticComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-12 text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <MessagesSquare className="size-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">{t('empty_title')}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{t('empty_description')}</p>
        </div>
      ) : (
        <div className="space-y-7">
          {optimisticComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
              loginHref={loginHref}
              currentUser={currentUser}
              activeReplyId={activeReplyId}
              activeEditId={activeEditId}
              isMutating={isPending}
              onToggleReply={handleToggleReply}
              onToggleEdit={handleToggleEdit}
              onCreateReply={(parentId, content) => handleCreateComment(content, parentId)}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </section>
  )
}
