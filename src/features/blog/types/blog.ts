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
  content: string
  excerpt: string
  locale: string
  translationGroupId?: string
  published: boolean
  authorId: string
  authorName?: string
  tags: BlogCategory[]
  readTimeMinutes: number
  createdAt: Date
  updatedAt: Date
}

export interface BlogPostCardItem {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: BlogCategory[]
  readTimeMinutes: number
  publishedAt: Date
  coverBadge?: string
  domainWatermark?: string
}
