export interface BlogCategory {
  id: string
  name: string
  slug: string
  postCount?: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  content: string
  excerpt: string
  coverImage?: string | null
  locale: string
  translationGroupId?: string
  published: boolean
  authorId: string
  authorName?: string
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
