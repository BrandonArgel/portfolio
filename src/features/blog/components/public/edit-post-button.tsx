import { Pencil } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/button'
import { getOptionalSession } from '@/lib/auth/get-optional-session'
import { cn } from '@/lib/utils'

interface EditPostButtonProps {
  authorId: string
  slug: string
  className?: string
}

export async function EditPostButton({ authorId, slug, className }: EditPostButtonProps) {
  const session = await getOptionalSession()

  const canEdit = session?.user?.id === authorId || session?.user?.role === 'admin'

  if (!canEdit) {
    return null
  }

  const t = await getTranslations('features.blog.reader')

  return (
    <LinkButton
      href={`/dashboard/posts/${slug}/edit`}
      variant="outline"
      size="icon"
      aria-label={t('actions.edit')}
      title={t('actions.edit')}
      className={cn('border-border bg-card hover:bg-muted', className)}
    >
      <Pencil className="size-4 text-muted-foreground" />
    </LinkButton>
  )
}
