import { Pencil } from 'lucide-react'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/button'
import { auth } from '@/lib/auth/auth'
import { cn } from '@/lib/utils'

interface EditPostButtonProps {
  authorId: string
  slug: string
  className?: string
}

export async function EditPostButton({ authorId, slug, className }: EditPostButtonProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const canEdit = session?.user?.id === authorId || session?.user?.role === 'admin'

  if (!canEdit) {
    return null
  }

  const t = await getTranslations('features.blog.reader')

  return (
    <LinkButton
      href={`/dashboard/posts/${slug}/edit`}
      variant="outline"
      size="sm"
      className={cn('gap-1.5 text-xs font-medium border-border hover:bg-muted', className)}
    >
      <Pencil className="size-3.5 text-muted-foreground" />
      <span>{t('actions.edit')}</span>
    </LinkButton>
  )
}
