'use client'

import {
  Edit3,
  GitMerge,
  PlusCircle,
  RotateCcw,
  Search,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { startTransition, useMemo, useOptimistic, useState, useTransition } from 'react'
import { sileo } from 'sileo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Link, useRouter } from '@/i18n/navigation'
import { deleteCategoryAction, deleteUnusedCategoriesAction } from '../../actions/category-actions'
import { useCategoryErrors } from '../../hooks/use-category-errors'
import type { AdminCategoryItem } from '../../types'
import { CategoryFormDialog } from './category-form-dialog'
import { MergeCategoryDialog } from './merge-category-dialog'

interface CategoriesManagerProps {
  initialCategories: AdminCategoryItem[]
}

type CategoryOptimisticAction =
  | { type: 'create'; category: AdminCategoryItem }
  | { type: 'update'; category: AdminCategoryItem }
  | { type: 'delete'; id: string }
  | { type: 'delete_many'; ids: ReadonlySet<string> }

function applyCategoryOptimisticAction(
  state: AdminCategoryItem[],
  action: CategoryOptimisticAction,
): AdminCategoryItem[] {
  switch (action.type) {
    case 'create':
      return [...state, action.category].sort((a, b) => a.name.localeCompare(b.name))
    case 'update':
      return state
        .map((cat) => (cat.id === action.category.id ? action.category : cat))
        .sort((a, b) => a.name.localeCompare(b.name))
    case 'delete':
      return state.filter((item) => item.id !== action.id)
    case 'delete_many':
      return state.filter((cat) => !action.ids.has(cat.id))
  }
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const t = useTranslations('features.blog.categories')
  const tManagement = useTranslations('features.blog.management')
  const router = useRouter()
  const { handleCategoryError } = useCategoryErrors()

  const [categories, applyOptimisticCategories] = useOptimistic<
    AdminCategoryItem[],
    CategoryOptimisticAction
  >(initialCategories, applyCategoryOptimisticAction)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'unused'>('all')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null)
  const [mergingCategory, setMergingCategory] = useState<AdminCategoryItem | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [isCleanUnusedDialogOpen, setIsCleanUnusedDialogOpen] = useState(false)

  const [isPendingDelete, startDeleteTransition] = useTransition()
  const [isPendingClean, startCleanTransition] = useTransition()

  const unusedCount = useMemo(
    () => categories.filter((cat) => cat.totalPosts === 0).length,
    [categories],
  )

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return categories.filter((cat) => {
      if (filterMode === 'unused' && cat.totalPosts > 0) {
        return false
      }

      if (!normalizedQuery) return true

      return (
        cat.name.toLowerCase().includes(normalizedQuery) ||
        cat.slug.toLowerCase().includes(normalizedQuery) ||
        cat.description.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [categories, filterMode, searchQuery])

  const hasActiveFilters = Boolean(searchQuery.trim()) || filterMode !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterMode('all')
  }

  const handleCategoryCreated = (created: AdminCategoryItem) => {
    startTransition(() => {
      applyOptimisticCategories({ type: 'create', category: created })
      router.refresh()
    })
  }

  const handleCategoryUpdated = (updated: AdminCategoryItem) => {
    startTransition(() => {
      applyOptimisticCategories({ type: 'update', category: updated })
      router.refresh()
    })
  }

  const handleDeleteCategory = (category: AdminCategoryItem) => {
    setDeletingCategoryId(category.id)
    startDeleteTransition(async () => {
      const [err, result] = await deleteCategoryAction({ id: category.id })
      setDeletingCategoryId(null)

      if (err) {
        handleCategoryError(err)
        return
      }

      sileo.success({
        title: t('notifications.deleted_title'),
        description: t('notifications.deleted_description', { name: result.name }),
      })

      startTransition(() => {
        applyOptimisticCategories({ type: 'delete', id: category.id })
        router.refresh()
      })
    })
  }

  const handleCleanUnused = () => {
    startCleanTransition(async () => {
      const [err, result] = await deleteUnusedCategoriesAction()
      if (err) {
        handleCategoryError(err)
        return
      }

      setIsCleanUnusedDialogOpen(false)
      sileo.success({
        title: t('notifications.cleaned_title'),
        description: t('notifications.cleaned_description', {
          count: result.deletedCount,
        }),
      })

      const deletedSet = new Set(result.deletedIds)
      if (filterMode === 'unused') {
        setFilterMode('all')
      }
      startTransition(() => {
        applyOptimisticCategories({ type: 'delete_many', ids: deletedSet })
        router.refresh()
      })
    })
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header & Summary Actions */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                {tManagement('dashboard')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-2">
          {unusedCount > 0 && (
            <AlertDialog open={isCleanUnusedDialogOpen} onOpenChange={setIsCleanUnusedDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPendingClean}
                    className="gap-1.5 cursor-pointer text-xs shadow-xs"
                  >
                    {isPendingClean ? (
                      <Spinner className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5 text-amber-500" />
                    )}
                    <span>{t('actions.clean_unused', { count: unusedCount })}</span>
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('clean_dialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('clean_dialog.description', { count: unusedCount })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPendingClean}>
                    {t('actions.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleCleanUnused}
                    disabled={isPendingClean}
                  >
                    {isPendingClean && <Spinner className="size-3.5 animate-spin mr-1.5" />}
                    {t('clean_dialog.confirm', { count: unusedCount })}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="size-4" />
            <span>{t('actions.new_category')}</span>
          </Button>
        </div>
      </header>

      {/* Toolbar: Search + Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64 lg:w-80">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>

        <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
          <Button
            type="button"
            variant={filterMode === 'all' ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => setFilterMode('all')}
            className="h-7 px-2.5 text-xs cursor-pointer"
          >
            {t('filters.all', { count: categories.length })}
          </Button>
          <Button
            type="button"
            variant={filterMode === 'unused' ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => setFilterMode('unused')}
            className="h-7 px-2.5 text-xs cursor-pointer"
          >
            {t('filters.unused', { count: unusedCount })}
          </Button>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="gap-1.5 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>{tManagement('reset_filters')}</span>
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {categories.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('showing_count', {
            shown: filteredCategories.length,
            total: categories.length,
          })}
        </p>
      )}

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <Empty className="py-16 border border-dashed border-border/70 rounded-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Tags />
            </EmptyMedia>
            <EmptyTitle>
              {hasActiveFilters ? t('empty.no_results_title') : t('empty.no_categories_title')}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? t('empty.no_results_description')
                : t('empty.no_categories_description')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3">
          {filteredCategories.map((cat) => {
            const isUnused = cat.totalPosts === 0
            const isDeletingThis = isPendingDelete && deletingCategoryId === cat.id

            return (
              <Card
                key={cat.id}
                className="border-border/70 hover:border-border transition-all shadow-xs"
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="font-semibold text-base text-foreground truncate">
                        {cat.name}
                      </h2>

                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        /{cat.slug}
                      </span>

                      {isUnused ? (
                        <Badge variant="softOrange" className="text-xs">
                          {t('badges.unused')}
                        </Badge>
                      ) : (
                        <Badge variant="softPrimary" className="text-xs">
                          {t('badges.articles_count', { count: cat.totalPosts })}
                        </Badge>
                      )}

                      {!isUnused && (cat.publishedPosts > 0 || cat.draftPosts > 0) && (
                        <span className="text-xs text-muted-foreground">
                          {t('badges.breakdown', {
                            published: cat.publishedPosts,
                            drafts: cat.draftPosts,
                          })}
                        </span>
                      )}
                    </div>

                    {cat.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {cat.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(cat)}
                      className="gap-1.5 cursor-pointer text-xs h-8"
                    >
                      <Edit3 className="size-3.5" />
                      <span>{t('actions.edit')}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={categories.length < 2}
                      onClick={() => setMergingCategory(cat)}
                      className="gap-1.5 cursor-pointer text-xs h-8"
                    >
                      <GitMerge className="size-3.5" />
                      <span>{t('actions.merge')}</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isDeletingThis}
                            className="gap-1.5 cursor-pointer text-xs h-8"
                          >
                            {isDeletingThis ? (
                              <Spinner className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            <span>{t('actions.delete')}</span>
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t('delete_dialog.title', { name: cat.name })}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {cat.totalPosts > 0
                              ? t('delete_dialog.description_used', {
                                  name: cat.name,
                                  count: cat.totalPosts,
                                })
                              : t('delete_dialog.description_unused', {
                                  name: cat.name,
                                })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeletingThis}>
                            {t('actions.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDeleteCategory(cat)}
                            disabled={isDeletingThis}
                          >
                            {isDeletingThis && <Spinner className="size-3.5 animate-spin mr-1.5" />}
                            {t('actions.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <CategoryFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCategoryCreated}
      />

      {/* Edit Dialog */}
      <CategoryFormDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null)
        }}
        category={editingCategory}
        onSuccess={handleCategoryUpdated}
      />

      {/* Merge Dialog */}
      <MergeCategoryDialog
        open={Boolean(mergingCategory)}
        onOpenChange={(open) => {
          if (!open) setMergingCategory(null)
        }}
        sourceCategory={mergingCategory}
        allCategories={categories}
        onMerged={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
