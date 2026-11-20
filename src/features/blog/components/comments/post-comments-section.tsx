import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { getPostComments } from '@/features/blog/services/comments-service'
import type { CommentAuthor } from '@/features/blog/types'
import { auth } from '@/lib/auth/auth'
import { assertNever } from '@/utils/result'
import { CommentsThreadClient } from './comments-thread-client'

export interface PostCommentsSectionProps {
  postId: string
  postAuthorId: string
  postSlug: string
}

export async function PostCommentsSection({
  postId,
  postAuthorId,
  postSlug,
}: PostCommentsSectionProps) {
  const [[err, commentsData], session] = await Promise.all([
    getPostComments(postId),
    auth.api.getSession({
      headers: await headers(),
    }),
  ])

  if (err || !commentsData) {
    if (err) {
      switch (err.reason) {
        case 'DATABASE_ERROR':
          break
        default:
          return assertNever(err.reason)
      }
    }

    const t = await getTranslations('features.blog.reader.comments')

    return (
      <section
        id="comments"
        aria-labelledby="comments-error-heading"
        className="mt-16 scroll-mt-24 border-t border-border pt-12"
      >
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center">
          <h2 id="comments-error-heading" className="text-base font-semibold text-destructive">
            {t('error_loading')}
          </h2>
        </div>
      </section>
    )
  }

  const currentUser: CommentAuthor | null =
    session?.user && !session.user.banned
      ? {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image ?? null,
          role: session.user.role ?? 'user',
        }
      : null

  return (
    <CommentsThreadClient
      postId={postId}
      postAuthorId={postAuthorId}
      postSlug={postSlug}
      initialComments={commentsData.comments}
      currentUser={currentUser}
    />
  )
}
