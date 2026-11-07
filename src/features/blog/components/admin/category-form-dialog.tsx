'use client'

import { RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type FormEvent, useEffect, useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { createCategoryAction, updateCategoryAction } from '../../actions/category-actions'
import { useCategoryErrors } from '../../hooks/use-category-errors'
import { normalizeCategorySlug } from '../../schemas/category.schema'
import type { AdminCategoryItem } from '../../types'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: AdminCategoryItem | null
  onSuccess?: (category: AdminCategoryItem) => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category)
  const t = useTranslations('features.blog.categories')
  const { handleCategoryError } = useCategoryErrors()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setSlug(category.slug)
        setDescription(category.description || '')
        setSlugTouched(true)
      } else {
        setName('')
        setSlug('')
        setDescription('')
        setSlugTouched(false)
      }
    }
  }, [open, category])

  const handleNameChange = (nextName: string) => {
    setName(nextName)
    if (!slugTouched) {
      setSlug(normalizeCategorySlug(nextName))
    }
  }

  const handleSlugChange = (nextSlug: string) => {
    setSlugTouched(true)
    setSlug(nextSlug)
  }

  const handleSyncSlug = () => {
    setSlug(normalizeCategorySlug(name))
    setSlugTouched(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const normalizedSlug = normalizeCategorySlug(slug.trim() || trimmedName)

    if (!trimmedName || !normalizedSlug) {
      handleCategoryError({
        reason: 'VALIDATION_ERROR',
      })
      return
    }

    startTransition(async () => {
      if (isEditing && category) {
        const [err, updated] = await updateCategoryAction({
          id: category.id,
          name: trimmedName,
          slug: normalizedSlug,
          description: description.trim(),
        })

        if (err) {
          handleCategoryError(err)
          return
        }

        sileo.success({
          title: t('notifications.updated_title'),
          description: t('notifications.updated_description', { name: updated.name }),
        })
        onSuccess?.(updated)
        onOpenChange(false)
      } else {
        const [err, created] = await createCategoryAction({
          name: trimmedName,
          slug: normalizedSlug,
          description: description.trim(),
        })

        if (err) {
          handleCategoryError(err)
          return
        }

        sileo.success({
          title: t('notifications.created_title'),
          description: t('notifications.created_description', { name: created.name }),
        })
        onSuccess?.(created)
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.edit_title') : t('form.create_title')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('form.edit_description') : t('form.create_description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">{t('form.name_label')}</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t('form.name_placeholder')}
              maxLength={60}
              required
              disabled={isPending}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="category-slug">{t('form.slug_label')}</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleSyncSlug}
                disabled={isPending || !name.trim()}
                className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>{t('form.sync_slug')}</span>
              </Button>
            </div>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-2.5 font-mono text-xs text-muted-foreground">
                /
              </span>
              <Input
                id="category-slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={() => setSlug((prev) => normalizeCategorySlug(prev || name))}
                placeholder={t('form.slug_placeholder')}
                className="pl-6 font-mono text-xs"
                maxLength={80}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-description">{t('form.description_label')}</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.description_placeholder')}
              maxLength={240}
              rows={3}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="gap-1.5 cursor-pointer"
            >
              {isPending && <Spinner className="size-3.5 animate-spin" />}
              <span>{isEditing ? t('actions.save_changes') : t('actions.create')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
