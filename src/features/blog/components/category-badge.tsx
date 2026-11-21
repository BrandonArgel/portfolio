import type { VariantProps } from 'class-variance-authority'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import type { BlogCategory } from '../types'

interface CategoryBadgeProps {
  category: BlogCategory
  variant?: VariantProps<typeof badgeVariants>['variant']
  interactive?: boolean
  className?: string
}

export function CategoryBadge({
  category,
  variant = 'default',
  interactive = true,
  className,
}: CategoryBadgeProps) {
  if (!interactive) {
    return (
      <Badge variant={variant} className={className}>
        {category.name}
      </Badge>
    )
  }

  return (
    <Badge
      variant={variant}
      className={className}
      render={<Link href={`/blog?category=${encodeURIComponent(category.slug)}`} />}
    >
      {category.name}
    </Badge>
  )
}
