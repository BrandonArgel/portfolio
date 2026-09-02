'use client'

import Editor from '@monaco-editor/react'
import matter from 'gray-matter'
import { ChevronDown, Languages, Loader2, Save, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useRef, useState } from 'react'
import { sileo } from 'sileo'
import { savePostAction } from '@/actions/posts.action'
import { translatePostAction } from '@/actions/translate-post.action'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LOCALE_META } from '@/config/locale'
import { useRouter } from '@/i18n/navigation'
import { type Locale, routing } from '@/i18n/routing'
import { MarkdownPreview } from './markdown-preview'

interface BlogEditorProps {
  initialId?: string
  initialContent?: string
}

export function BlogEditor({ initialId, initialContent }: BlogEditorProps) {
  const t = useTranslations('blog_editor')
  const router = useRouter()
  const [rawMarkdown, setRawMarkdown] = useState(initialContent || t('default_content'))
  const lastSavePublishedRef = useRef(false)

  const { execute: executeSave, isExecuting } = useAction(savePostAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        sileo.success({
          title: initialId ? t('notifications.post_updated') : t('notifications.post_created'),
        })
        if (lastSavePublishedRef.current) {
          router.push(`/blog/${res.data.slug}`)
        } else {
          router.push(`/dashboard/blog/${res.data.slug}/edit`)
        }
      }
    },
    onError: ({ error }) => {
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('notifications.validation_error'),
        description: serverError?.description,
      })
    },
  })

  const { execute: executeTranslate, isExecuting: isTranslating } = useAction(translatePostAction, {
    onSuccess: (res) => {
      if (res.data?.success && res.data.results) {
        if (res.data.results.length === 1) {
          sileo.success({
            title: t('notifications.post_translated'),
          })
          router.push(`/dashboard/blog/${res.data.results[0].slug}/edit`)
        } else {
          const translatedLocales = res.data.results
            .map((item) => item.locale.toUpperCase())
            .join(', ')

          sileo.success({
            title: t('notifications.post_translated'),
            description: t('notifications.posts_translated_all', { locales: translatedLocales }),
          })
          router.refresh()
        }
      }
    },
    onError: ({ error }) => {
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('notifications.translate_error'),
        description: serverError?.description,
      })
    },
  })

  const handleSave = () => {
    try {
      const { data: frontmatter, content } = matter(rawMarkdown)

      if (!frontmatter.title || !frontmatter.slug || !frontmatter.locale) {
        sileo.error({ title: t('notifications.frontmatter_required') })
        return
      }

      const tagsArray = Array.isArray(frontmatter.tags)
        ? frontmatter.tags
        : typeof frontmatter.tags === 'string'
          ? frontmatter.tags.split(',').map((tTag: string) => tTag.trim())
          : []

      const isPublished = frontmatter.published === true
      lastSavePublishedRef.current = isPublished

      executeSave({
        id: initialId,
        title: frontmatter.title,
        slug: frontmatter.slug,
        locale: frontmatter.locale,
        translationGroupId: frontmatter.translationGroupId,
        published: isPublished,
        tags: tagsArray,
        content: content,
      })
    } catch {
      sileo.error({ title: t('notifications.frontmatter_invalid') })
    }
  }

  // Parse frontmatter to detect current locale and calculate available target locales
  let currentPostLocale: string = 'en'
  try {
    const { data: frontmatter } = matter(rawMarkdown)
    if (frontmatter.locale) {
      currentPostLocale = frontmatter.locale
    }
  } catch {
    // If frontmatter is temporarily invalid, keep fallback
  }

  const availableLocales = routing.locales.filter((loc) => loc !== currentPostLocale) as Locale[]

  const handleTranslateSingle = (targetLocale: Locale) => {
    if (!initialId) return
    sileo.info({
      title: t('translating_to', { locale: targetLocale.toUpperCase() }),
    })
    executeTranslate({ postId: initialId, targetLocales: [targetLocale] })
  }

  const handleTranslateAll = () => {
    if (!initialId || availableLocales.length === 0) return
    sileo.info({
      title: t('translating_all'),
    })
    executeTranslate({ postId: initialId, targetLocales: availableLocales })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] border border-border/80 rounded-xl overflow-hidden bg-background shadow-xs">
      <div className="flex shrink-0 items-center justify-between px-4 py-2.5 border-b border-border/80 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {initialId ? t('editing_post') : t('new_post')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {initialId && availableLocales.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 cursor-pointer"
                    disabled={isTranslating || isExecuting}
                  >
                    {isTranslating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Languages className="size-4" />
                    )}
                    <span>{isTranslating ? t('translating_button') : t('translate_button')}</span>
                    <ChevronDown className="size-3.5 opacity-60" />
                  </Button>
                }
              />

              <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg border-border/70">
                {availableLocales.length > 1 && (
                  <>
                    <DropdownMenuItem
                      onClick={handleTranslateAll}
                      disabled={isTranslating}
                      className="gap-2 cursor-pointer font-medium text-primary focus:text-primary"
                    >
                      <Sparkles className="size-4 text-primary" />
                      <span className="flex-1 truncate">{t('translate_all_button')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {availableLocales.map((loc) => {
                  const meta = LOCALE_META[loc]

                  return (
                    <DropdownMenuItem
                      key={loc}
                      onClick={() => handleTranslateSingle(loc)}
                      disabled={isTranslating}
                      className="gap-2.5 cursor-pointer"
                    >
                      <span aria-hidden="true" className="text-base">
                        {meta?.flag}
                      </span>
                      <span className="flex-1 truncate">{meta?.nativeName ?? loc}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={handleSave}
            disabled={isExecuting || isTranslating}
            size="sm"
            className="gap-2 cursor-pointer"
          >
            {isExecuting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isExecuting ? t('saving_button') : t('save_button')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border/80">
        <div className="h-[450px] lg:h-full w-full">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={rawMarkdown}
            onChange={(value) => setRawMarkdown(value || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              padding: { top: 20, bottom: 20 },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="h-[450px] lg:h-full overflow-hidden bg-card/30">
          <MarkdownPreview rawContent={rawMarkdown} />
        </div>
      </div>
    </div>
  )
}
