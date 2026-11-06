export interface BlogCategory {
  id: string
  name: string
  slug: string
  postCount?: number
}

export interface BlogPost {
  id: string
  title: string
  description: string
  slug: string
  content: string
  draftContent?: string | null
  excerpt: string
  coverImage?: string | null
  published: boolean
  draft: boolean
  locale: string
  translationGroupId?: string
  authorId: string
  authorName?: string
  lastModifiedBy?: string | null
  lastEditorName?: string | null
  categories: BlogCategory[]
  readTimeMinutes: number
  createdAt: Date
  updatedAt: Date
}

export interface BlogPostCardItem {
  id: string
  title: string
  slug: string
  description: string
  excerpt: string
  coverImage?: string | null
  categories: BlogCategory[]
  readTimeMinutes: number
  publishedAt: Date
  coverBadge?: string
  domainWatermark?: string
}

export interface CommentAuthor {
  id: string
  name: string
  image: string | null
  role: string
}

export interface BlogComment {
  id: string
  content: string
  postId: string
  authorId: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  author: CommentAuthor
  replies: BlogComment[]
}

export interface PostCommentsData {
  comments: BlogComment[]
  totalCount: number
}
