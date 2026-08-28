import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface AuthSkeletonProps {
  className?: string
}

export function AuthSkeleton({ className }: AuthSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Skeleton className="size-8 rounded-full" />
      <span className="sr-only">Loading session...</span>
    </div>
  )
}
