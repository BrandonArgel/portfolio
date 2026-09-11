'use client'

import {
  AlignLeft,
  ChevronDownIcon,
  Hash,
  Image as ImageIcon,
  Languages,
  Link2,
  Loader2,
  ToggleLeft,
  Type,
  Upload,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Switch } from '@/components/ui/switch'
import { LOCALE_META } from '@/config/locale'
import { uploadImageAction } from '@/features/blog/actions/image.action'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { generateSlug } from '@/utils/string-utils'
import { type BlogFrontmatter, BlogFrontmatterSchema } from '../schemas/post.schema'

const inputStyles =
  'w-full bg-muted/20 border border-border/50 focus:bg-background focus:ring-1 focus:ring-ring focus:outline-none transition-all rounded-md px-3 py-2 text-sm'

const iconLabelStyles =
  'flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors'

interface BlogFrontmatterPanelProps {
  data: BlogFrontmatter
  onChange: (newData: BlogFrontmatter) => void
  existingCategories?: string[]
}

export function BlogFrontmatterPanel({
  data,
  onChange,
  existingCategories = [],
}: BlogFrontmatterPanelProps) {
  const t = useTranslations('features.blog.composer')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [categoryInput, setCategoryInput] = useState('')
  const chipsAnchor = useComboboxAnchor()

  const filteredCategories = existingCategories.filter(
    (c) => !data.categories.includes(c) && c.toLowerCase().includes(categoryInput.toLowerCase()),
  )

  const showCreate =
    categoryInput.trim() !== '' &&
    ![...filteredCategories, ...data.categories].some(
      (c) => c.toLowerCase() === categoryInput.trim().toLowerCase(),
    )

  const validation = BlogFrontmatterSchema.safeParse(data)
  const errors = !validation.success ? validation.error.flatten().fieldErrors : {}

  const updateField = (key: keyof BlogFrontmatter, value: any) => {
    const newData = { ...data, [key]: value }

    if (key === 'title') {
      newData.slug = generateSlug(value)
    }

    onChange(newData)
  }

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const newCategory = categoryInput.trim()
      if (newCategory) {
        const exists = data.categories.some((c) => c.toLowerCase() === newCategory.toLowerCase())

        if (!exists) {
          updateField('categories', [...data.categories, newCategory])
        }

        setCategoryInput('')
      }
    }
  }

  const { execute: executeUploadCover, isExecuting: isUploadingCover } = useAction(
    uploadImageAction,
    {
      onSuccess: (res) => {
        if (res.data?.success && res.data.url) {
          updateField('coverImage', res.data.url)
          sileo.success({ title: t('notifications.cover_uploaded') })
        }
      },
      onError: ({ error }) => {
        sileo.error({
          title: t('notifications.cover_upload_error'),
          description: error.serverError?.description,
        })
      },
    },
  )

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      sileo.error({
        title: t('notifications.invalid_file_title'),
        description: t('notifications.invalid_file_description'),
      })
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    executeUploadCover({ formData })
    e.target.value = ''
  }

  return (
    <Card className="mb-4">
      <Collapsible className="rounded-md">
        <CardHeader className="w-full flex items-center gap-2">
          <CollapsibleTrigger
            render={
              <Button variant="ghost" className="w-full justify-between" size="sm">
                <CardTitle>{t('frontmatter.title')}</CardTitle>
                <ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <CollapsibleContent className="p-4 pt-0 border-t border-border/50">
            <div className="grid gap-3 mt-4">
              {/* TÍTULO Y SLUG */}
              <div className="grid grid-cols-[160px_1fr] items-start gap-4 group">
                <div className={cn(iconLabelStyles, 'mt-2.5')}>
                  <Type className="size-4" />
                  <span>{t('frontmatter.field_title')}</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={cn(
                      inputStyles,
                      'font-medium',
                      errors.title &&
                        'border-destructive/50 bg-destructive/10 focus:ring-destructive/50',
                    )}
                    placeholder={t('frontmatter.title_placeholder')}
                  />
                  {data.title && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 px-1 mt-1.5">
                      <Link2 className="size-3" />
                      <span>/{data.slug}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="grid grid-cols-[160px_1fr] items-start gap-4 group">
                <div className={cn(iconLabelStyles, 'mt-2.5')}>
                  <AlignLeft className="size-4" />
                  <span>{t('frontmatter.field_description')}</span>
                </div>
                <textarea
                  value={data.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                  className={cn(inputStyles, 'resize-none')}
                  placeholder={t('frontmatter.description_placeholder')}
                />
              </div>

              {/* COVER IMAGE CON BOTÓN DE UPLOAD */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4 group">
                <div className={iconLabelStyles}>
                  <ImageIcon className="size-4" />
                  <span>{t('frontmatter.field_cover_image')}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={data.coverImage || ''}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    className={cn(inputStyles, 'flex-1')}
                    placeholder={t('frontmatter.cover_image_placeholder')}
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CATEGORÍAS */}
              <div className="grid grid-cols-[160px_1fr] items-start gap-4 group">
                <div className={cn(iconLabelStyles, 'mt-2')}>
                  <Hash className="size-4" />
                  <span>{t('frontmatter.field_categories')}</span>
                </div>
                <Combobox<string, true>
                  multiple
                  value={data.categories}
                  onValueChange={(value) => updateField('categories', value)}
                  onInputValueChange={(inputValue) => setCategoryInput(inputValue)}
                >
                  <ComboboxValue>
                    {(selectedCategories: string[]) => (
                      <ComboboxChips ref={chipsAnchor}>
                        {selectedCategories.map((cat) => (
                          <ComboboxChip key={cat}>{cat}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          onKeyDown={handleCategoryKeyDown}
                          placeholder={t('frontmatter.add_category_placeholder')}
                        />
                      </ComboboxChips>
                    )}
                  </ComboboxValue>
                  <ComboboxContent anchor={chipsAnchor}>
                    <ComboboxList>
                      {filteredCategories.map((cat) => (
                        <ComboboxItem key={cat} value={cat}>
                          {cat}
                        </ComboboxItem>
                      ))}
                      {showCreate && (
                        <ComboboxItem value={categoryInput.trim()}>
                          {t('frontmatter.create_category', { category: categoryInput.trim() })}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                    {filteredCategories.length === 0 && !showCreate && (
                      <ComboboxEmpty>{t('frontmatter.no_categories_found')}</ComboboxEmpty>
                    )}
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* LOCALE */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4 group">
                <div className={iconLabelStyles}>
                  <Languages className="size-4" />
                  <span>{t('frontmatter.field_locale')}</span>
                </div>
                <Combobox<string>
                  value={data.locale}
                  onValueChange={(value) => {
                    if (value) updateField('locale', value as Locale)
                  }}
                  itemToStringLabel={(code) => LOCALE_META[code as Locale]?.nativeName ?? code}
                >
                  <ComboboxInput
                    placeholder={t('frontmatter.select_locale_placeholder')}
                    className="w-52"
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {Object.entries(LOCALE_META).map(([code, meta]) => (
                        <ComboboxItem key={code} value={code}>
                          <span>{meta.flag}</span>
                          <span>{meta.nativeName}</span>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* PUBLISHED */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4 group">
                <div className={iconLabelStyles}>
                  <ToggleLeft className="size-4" />
                  <span>{t('frontmatter.field_published')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={data.published}
                    onCheckedChange={(checked) => updateField('published', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {data.published ? t('frontmatter.status_live') : t('frontmatter.status_draft')}
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  )
}
