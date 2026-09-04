'use client'

import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import { useTheme } from '@teispace/next-themes'
import matter from 'gray-matter'
import {
  ArrowLeft,
  ChevronDown,
  ImageIcon,
  ImagePlus,
  Languages,
  Loader2,
  Save,
  Sparkles,
} from 'lucide-react'
import type { editor } from 'monaco-editor'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { LOCALE_META } from '@/config/locale'
import { uploadImageAction } from '@/features/blog/actions/image.actions'
import { savePostAction } from '@/features/blog/actions/posts.action'
import { translatePostAction } from '@/features/blog/actions/translate-post.action'
import { useRouter } from '@/i18n/navigation'
import { type Locale, routing } from '@/i18n/routing'
import { MarkdownPreview } from './markdown-preview'

interface BlogEditorProps {
  initialId?: string
  initialContent?: string
}

function updateCoverImageFrontmatter(markdown: string, imageUrl: string): string {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/
  const match = markdown.match(frontmatterRegex)

  if (match) {
    const yamlContent = match[1]
    let updatedYaml: string

    const coverRegex = /^(coverImage|cover_image):\s*.*$/m
    if (coverRegex.test(yamlContent)) {
      updatedYaml = yamlContent.replace(coverRegex, `coverImage: "${imageUrl}"`)
    } else {
      const trimmedYaml = yamlContent.trimEnd()
      updatedYaml = `${trimmedYaml}\ncoverImage: "${imageUrl}"`
    }

    return markdown.replace(frontmatterRegex, () => `---\n${updatedYaml}\n---`)
  }

  return `---\ncoverImage: "${imageUrl}"\n---\n\n${markdown}`
}

export function BlogEditor({ initialId, initialContent }: BlogEditorProps) {
  const t = useTranslations('blog_editor')
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [rawMarkdown, setRawMarkdown] = useState(initialContent || t('default_content'))
  const [savedMarkdown, setSavedMarkdown] = useState(initialContent || t('default_content'))
  const lastSavePublishedRef = useRef(false)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const coverFileInputRef = useRef<HTMLInputElement | null>(null)

  const hasUnsavedChanges = rawMarkdown !== savedMarkdown

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const { execute: executeSave, isExecuting } = useAction(savePostAction, {
    onSuccess: (res) => {
      if (res.data?.success) {
        setSavedMarkdown(rawMarkdown)
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

  // ── Image upload ────────────────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false)

  const { execute: executeUpload } = useAction(uploadImageAction, {
    onSuccess: (res) => {
      if (res.data?.success && res.data.url) {
        const monacoEditor = editorRef.current
        if (monacoEditor) {
          const selection = monacoEditor.getSelection()
          // Prepend two newlines so it doesn't concatenate with previous lines
          const markdownImage = `\n\n![Image](${res.data.url})\n\n`

          if (selection) {
            monacoEditor.executeEdits('image-upload', [
              { range: selection, text: markdownImage, forceMoveMarkers: true },
            ])
          } else {
            // Fallback: append at the end of the document
            const model = monacoEditor.getModel()
            if (model) {
              const lastLine = model.getLineCount()
              const lastCol = model.getLineMaxColumn(lastLine)
              monacoEditor.executeEdits('image-upload', [
                {
                  range: {
                    startLineNumber: lastLine,
                    startColumn: lastCol,
                    endLineNumber: lastLine,
                    endColumn: lastCol,
                  },
                  text: markdownImage,
                  forceMoveMarkers: true,
                },
              ])
            }
          }

          monacoEditor.focus()
        }

        sileo.success({ title: t('notifications.image_uploaded') })
      }
      setIsUploading(false)
    },
    onError: ({ error }) => {
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('notifications.image_upload_error'),
        description: serverError?.description,
      })
      setIsUploading(false)
    },
  })

  // ── Cover Image upload ──────────────────────────────────────────────────
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const { execute: executeUploadCover } = useAction(uploadImageAction, {
    onSuccess: (res) => {
      if (res.data?.success && res.data.url) {
        const monacoEditor = editorRef.current
        const currentContent = monacoEditor ? monacoEditor.getValue() : rawMarkdown
        const newMarkdown = updateCoverImageFrontmatter(currentContent, res.data.url)

        setRawMarkdown(newMarkdown)
        if (monacoEditor) {
          monacoEditor.setValue(newMarkdown)
          monacoEditor.focus()
        }

        sileo.success({ title: t('notifications.cover_uploaded') })
      }
      setIsUploadingCover(false)
    },
    onError: ({ error }) => {
      const serverError = error.serverError
      sileo.error({
        title: serverError?.title || t('notifications.image_upload_error'),
        description: serverError?.description,
      })
      setIsUploadingCover(false)
    },
  })

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      sileo.error({
        title: t('notifications.image_upload_error'),
        description: 'Only image files can be uploaded.',
      })
      return
    }

    setIsUploadingCover(true)
    const formData = new FormData()
    formData.append('file', file)
    executeUploadCover({ formData })

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const uploadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      sileo.error({
        title: t('notifications.image_upload_error'),
        description: 'Only image files can be uploaded.',
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    executeUpload({ formData })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    uploadFile(file)

    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handlePasteCapture = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData
    if (!clipboardData) return

    let imageFile: File | null = null

    // Check items first (for screenshots)
    if (clipboardData.items && clipboardData.items.length > 0) {
      const item = Array.from(clipboardData.items).find((i) => i.type.startsWith('image/'))
      if (item) imageFile = item.getAsFile()
    }

    // Fallback to files (for copied local files)
    if (!imageFile && clipboardData.files && clipboardData.files.length > 0) {
      imageFile = Array.from(clipboardData.files).find((f) => f.type.startsWith('image/')) || null
    }

    if (imageFile) {
      e.preventDefault()
      e.stopPropagation() // Block Monaco
      uploadFile(imageFile)
    }
  }

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('portfolio-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#09090b',
        'editor.lineHighlightBackground': '#18181b',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#e4e4e7',
        'editor.selectionBackground': '#27272a',
        'editorCursor.foreground': '#fafafa',
        'editorIndentGuide.background': '#18181b',
        'editorIndentGuide.activeBackground': '#3f3f46',
        'editor.selectionHighlightBackground': '#3f3f4680',
        'editorLineNumber.dimmedForeground': '#52525b',
      },
    })

    monaco.editor.defineTheme('portfolio-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.lineHighlightBackground': '#f4f4f5',
        'editorLineNumber.foreground': '#a1a1aa',
        'editorLineNumber.activeForeground': '#18181b',
        'editor.selectionBackground': '#e4e4e7',
        'editorCursor.foreground': '#18181b',
        'editorIndentGuide.background': '#f4f4f5',
        'editorIndentGuide.activeBackground': '#d4d4d8',
        'editor.selectionHighlightBackground': '#e4e4e780',
        'editorLineNumber.dimmedForeground': '#a1a1aa',
      },
    })
  }

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance
  }

  // ── Save ────────────────────────────────────────────────────────────────
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
        coverImage: frontmatter.coverImage || frontmatter.cover_image || null,
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

  const isBusy = isExecuting || isTranslating || isUploading || isUploadingCover

  return (
    <div className="w-full flex flex-col h-[calc(100vh-4rem)] border border-border/80 rounded-xl overflow-hidden bg-background shadow-xs">
      <div className="flex flex-col md:flex-row shrink-0 items-start md:items-center justify-between gap-3 p-3 sm:px-4 sm:py-3 border-b border-border/80 bg-muted/20 w-full">
        <div className="flex items-center justify-between w-full md:w-auto gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer shrink-0"
              onClick={() => {
                if (hasUnsavedChanges && !window.confirm(t('unsaved_changes_warning'))) return
                router.push('/dashboard/posts')
              }}
            >
              <ArrowLeft className="size-3.5" />
              <span>{t('back_to_posts')}</span>
            </Button>
            <div className="h-4 w-px bg-border/80 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm text-foreground truncate">
              {initialId ? t('editing_post') : t('new_post')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* ── Set Cover ── */}
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 sm:gap-2 text-xs h-8 sm:h-9 px-2.5 sm:px-3 cursor-pointer shrink-0"
            disabled={isBusy}
            onClick={() => coverFileInputRef.current?.click()}
          >
            {isUploadingCover ? (
              <Loader2 className="size-3.5 sm:size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-3.5 sm:size-4" />
            )}
            <span>{isUploadingCover ? t('uploading_cover_button') : t('set_cover_button')}</span>
          </Button>

          {/* ── Upload Image ── */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 sm:gap-2 text-xs h-8 sm:h-9 px-2.5 sm:px-3 cursor-pointer shrink-0"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="size-3.5 sm:size-4 animate-spin" />
            ) : (
              <ImageIcon className="size-3.5 sm:size-4" />
            )}
            <span>{isUploading ? t('uploading_image_button') : t('upload_image_button')}</span>
          </Button>

          {initialId && availableLocales.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 sm:gap-2 text-xs h-8 sm:h-9 px-2.5 sm:px-3 cursor-pointer shrink-0"
                    disabled={isBusy}
                  >
                    {isTranslating ? (
                      <Loader2 className="size-3.5 sm:size-4 animate-spin" />
                    ) : (
                      <Languages className="size-3.5 sm:size-4" />
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
            disabled={isBusy}
            size="sm"
            className="gap-1.5 sm:gap-2 text-xs h-8 sm:h-9 px-2.5 sm:px-3 cursor-pointer shrink-0"
          >
            {isExecuting ? (
              <Loader2 className="size-3.5 sm:size-4 animate-spin" />
            ) : (
              <Save className="size-3.5 sm:size-4" />
            )}
            <span>{isExecuting ? t('saving_button') : t('save_button')}</span>
          </Button>
        </div>
      </div>

      {mounted ? (
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="blog-editor-layout-v2"
          className="flex-1 min-h-0"
        >
          <ResizablePanel defaultSize={50} minSize={25}>
            <div
              className="h-full w-full min-w-0 overflow-hidden"
              onPasteCapture={handlePasteCapture}
            >
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={resolvedTheme === 'dark' ? 'portfolio-dark' : 'portfolio-light'}
                beforeMount={handleEditorWillMount}
                value={rawMarkdown}
                onChange={(value) => setRawMarkdown(value || '')}
                onMount={handleEditorMount}
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
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="h-full w-full overflow-hidden bg-card/30">
              <MarkdownPreview rawContent={rawMarkdown} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="flex flex-1 min-h-0 divide-x divide-border/60 bg-muted/5 animate-pulse">
          <div className="flex-1 bg-muted/10" />
          <div className="flex-1 bg-muted/5" />
        </div>
      )}
    </div>
  )
}
