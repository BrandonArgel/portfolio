import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { AnimatedText } from '@/components/ui/animated-text'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/ui/button'
import { Section, SectionTitle } from '@/components/ui/section'
import { getPublishedPosts } from '@/features/blog/services/posts.service'
import { BlogCard } from './blog-card'

interface RecentPostsSectionProps {
  limit?: number
  className?: string
}

export async function RecentPostsSection({ limit = 3, className }: RecentPostsSectionProps) {
  const t = await getTranslations('blog')

  const [err, posts] = await getPublishedPosts(undefined, undefined, limit)

  return (
    <Section
      withGlow
      className={className}
      topGlowColor="bg-blue-50/50 dark:bg-blue-950/20"
      bottomGlowColor="bg-purple-50/50 dark:bg-purple-950/20"
      containerClassName="flex flex-col group/anim"
    >
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col items-start gap-3">
          <Badge variant="softPrimary" size="lg">
            {t('badge')}
          </Badge>

          <SectionTitle as="h2">
            {t('title_prefix')}{' '}
            <AnimatedText text={t('title_highlight')} className="text-primary" />
          </SectionTitle>
        </div>

        <LinkButton
          href="/blog"
          variant="outline"
          size="default"
          className="group/btn gap-2 rounded-xl border-border/70 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/90 hover:shadow-lg"
        >
          <span>{t('view_all')}</span>
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </LinkButton>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {err ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            {t('error_loading_posts')}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post.id} post={post} />)
        ) : (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            {t('empty_posts')}
          </div>
        )}
      </div>
    </Section>
  )
}
