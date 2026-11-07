'use client'

import { ArrowRight, GitMerge } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { sileo } from 'sileo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { mergeCategoriesAction } from '../../actions/category-actions'
import { useCategoryErrors } from '../../hooks/use-category-errors'
import type { MergeCategoriesResult } from '../../services/categories-service'
import type { AdminCategoryItem } from '../../types'

interface MergeCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceCategory: AdminCategoryItem | null
  allCategories: AdminCategoryItem[]
  onMerged?: (result: MergeCategoriesResult) => void
}

export function MergeCategoryDialog({
  open,
  onOpenChange,
  sourceCategory,
  allCategories,
  onMerged,
}: MergeCategoryDialogProps) {
  const t = useTranslations('features.blog.categories')
  const { handleCategoryError } = useCategoryErrors()
  const [isPending, startTransition] = useTransition()

  // Guardamos el NOMBRE (o slug) en lugar del ID para que el usuario vea texto limpio
  const [targetCategoryName, setTargetCategoryName] = useState<string>('')

  const availableTargets = useMemo(
    () => allCategories.filter((cat) => cat.id !== sourceCategory?.id),
    [allCategories, sourceCategory?.id],
  )

  useEffect(() => {
    if (open) {
      // Seleccionamos por defecto el nombre de la primera categoría disponible
      setTargetCategoryName(availableTargets[0]?.name ?? '')
    }
  }, [open, availableTargets])

  // Objeto seleccionado basado en el nombre visible
  const selectedTarget = useMemo(
    () => availableTargets.find((cat) => cat.name === targetCategoryName) ?? null,
    [availableTargets, targetCategoryName],
  )

  // Obtenemos el ID real de forma derivada para enviarlo al servidor de manera limpia
  const targetCategoryId = selectedTarget?.id ?? ''

  const handleMerge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sourceCategory || !targetCategoryId) return

    startTransition(async () => {
      const [err, result] = await mergeCategoriesAction({
        sourceCategoryId: sourceCategory.id,
        targetCategoryId,
      })

      if (err) {
        handleCategoryError(err)
        return
      }

      sileo.success({
        title: t('notifications.merged_title'),
        description: t('notifications.merged_description', {
          source: result.sourceName,
          target: result.targetName,
          count: result.movedPostsCount,
        }),
      })

      onMerged?.(result)
      onOpenChange(false)
    })
  }

  if (!sourceCategory) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="size-4 text-primary" />
            <span>{t('merge.title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('merge.description', {
              source: sourceCategory.name,
              count: sourceCategory.totalPosts,
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleMerge} className="space-y-4">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/40 p-3 text-xs">
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{sourceCategory.name}</p>
              <p className="font-mono text-muted-foreground truncate">/{sourceCategory.slug}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 text-right">
              {selectedTarget ? (
                <>
                  <p className="font-medium text-primary truncate">{selectedTarget.name}</p>
                  <p className="font-mono text-muted-foreground truncate">/{selectedTarget.slug}</p>
                </>
              ) : (
                <span className="text-muted-foreground">{t('merge.select_placeholder')}</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('merge.target_label')}</Label>
            <Select
              value={targetCategoryName}
              onValueChange={(value) => setTargetCategoryName(value || '')}
              disabled={isPending || availableTargets.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('merge.select_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                      (/{cat.slug})
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {cat.totalPosts}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={isPending || !targetCategoryId}
              className="gap-1.5 cursor-pointer"
            >
              {isPending ? (
                <Spinner className="size-3.5 animate-spin" />
              ) : (
                <GitMerge className="size-3.5" />
              )}
              <span>{t('merge.confirm_button')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
