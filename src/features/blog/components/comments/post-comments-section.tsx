import { headers } from 'next/headers'
import { getPostComments } from '@/features/blog/services/comments-service'
import type { CommentAuthor } from '@/features/blog/types'
import { auth } from '@/lib/auth/auth'
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

  const initialComments = err || !commentsData ? [] : commentsData.comments

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
      initialComments={initialComments}
      currentUser={currentUser}
    />
  )
}
