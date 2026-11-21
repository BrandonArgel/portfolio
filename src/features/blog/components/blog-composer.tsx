'use client'

import { Settings2, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { discardDraftChangesAction, savePostAction } from '@/features/blog/actions/post-actions'
import { Editor } from '@/features/editor/components/editor'
import { EditorLoader } from '@/features/editor/components/editor-loader'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { generateSlug } from '@/utils/string-utils'
import { useImageUpload } from '../hooks/use-image-upload'
import { usePostErrors } from '../hooks/use-post-errors'
import {
  type BlogFrontmatter,
  defaultFrontmatter,
  type SavePostInput,
  validateSavePostInput,
} from '../schemas/post-schema'
import type { SavePostResult } from '../services/posts-mutation-service'
import { blogDraftsActions, useBlogDraftsStore } from '../store/use-blog-drafts-store'
import { EditorHeader } from './editor-header'
import { PostMetadataForm } from './post-metadata-form'

const DynamicBlogPostPreview = dynamic(
  () => import('./blog-post-preview').then((mod) => mod.BlogPostPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 min-h-0 h-full w-full items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    ),
  },
)

const DynamicPostMetadataSheet = dynamic(
  () => import('./post-metadata-sheet').then((mod) => mod.PostMetadataSheet),
  { ssr: false },
)

const AUTO_SAVE_INTERVAL_MS = 15_000

export interface BlogComposerProps {
  initialId?: string
  initialFrontmatter?: BlogFrontmatter
  initialContent?: string
  existingCategories?: string[]
  initialUpdatedAt?: string | Date | null
  authorName?: string | null
  authorImage?: string | null
  authorEmailVerified?: boolean
  viewsCount?: number
  lastEditorName?: string | null
  currentUserName?: string | null
  currentUserImage?: string | null
  currentUserEmailVerified?: boolean
}

export function BlogComposer({
  initialId,
  initialFrontmatter,
  initialContent,
  existingCategories,
  initialUpdatedAt,
  authorName,
  authorImage,
  authorEmailVerified,
  viewsCount = 0,
  lastEditorName,
  currentUserName,
  currentUserImage,
  currentUserEmailVerified,
}: BlogComposerProps) {
  const t = useTranslations('features.blog.composer')
  const tEditor = useTranslations('features.editor')
  const router = useRouter()
  const isMobile = useIsMobile()
  const metadataPanelRef = usePanelRef()
  const { handlePostError } = usePostErrors()

  const draftId = initialId || 'new'
  const [postId, setPostId] = useState<string | undefined>(initialId)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isDiscardingDraft, setIsDiscardingDraft] = useState(false)
  const [isMetadataSheetOpen, setIsMetadataSheetOpen] = useState(false)
  const [hasOpenedMetadataSheet, setHasOpenedMetadataSheet] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | Date | null | undefined>(
    initialUpdatedAt,
  )
  const [serverLastEditor, setServerLastEditor] = useState<string | null | undefined>(
    lastEditorName,
  )
  const [editorResetKey, setEditorResetKey] = useState(0)

  const currentRouteSlugRef = useRef<string | undefined>(
    initialId ? initialFrontmatter?.slug : undefined,
  )

  const isHydrated = useStoreHydration(useBlogDraftsStore)
  const draftFrontmatter = useBlogDraftsStore((state) => state.drafts[draftId]?.frontmatter)
  const draftLastSaved = useBlogDraftsStore((state) => state.drafts[draftId]?.lastSaved ?? null)
  const hasDraft = useBlogDraftsStore((state) => Boolean(state.drafts[draftId]))

  useEffect(() => {
    if (isHydrated && !hasDraft) {
      blogDraftsActions.initDraft(draftId, initialFrontmatter, initialContent)
    }
  }, [isHydrated, hasDraft, draftId, initialFrontmatter, initialContent])

  const frontmatter = draftFrontmatter || initialFrontmatter || defaultFrontmatter

  const lastSyncedTimestampRef = useRef<number | null>(null)

  const clearDraft = useCallback(() => {
    blogDraftsActions.clearDraft(draftId)
  }, [draftId])

  const openMetadataInspector = useCallback(() => {
    if (isMobile) {
      setHasOpenedMetadataSheet(true)
      setIsMetadataSheetOpen(true)
    } else if (metadataPanelRef.current?.isCollapsed()) {
      metadataPanelRef.current.expand()
    }
  }, [isMobile, metadataPanelRef])

  const syncSavedPostResult = useCallback(
    (result: SavePostResult, currentFrontmatter: BlogFrontmatter, isManualSave: boolean) => {
      setPostId(result.post.id)
      setServerUpdatedAt(result.updatedAt)
      setServerLastEditor(result.lastEditorName)

      const updatedFrontmatter: BlogFrontmatter = {
        ...currentFrontmatter,
        title: result.post.title,
        slug: result.post.slug,
        coverImageAlt: result.post.coverImageAlt ?? currentFrontmatter.coverImageAlt,
        canonicalUrl: result.post.canonicalUrl ?? currentFrontmatter.canonicalUrl,
        published: result.published,
        draft: result.draft,
      }
      blogDraftsActions.setFrontmatter(draftId, updatedFrontmatter)
      lastSyncedTimestampRef.current = Date.now()

      const routeSlug = currentRouteSlugRef.current
      const didRouteSlugChange =
        result.slugChanged || (Boolean(routeSlug) && result.post.slug !== routeSlug)

      if (!initialId && !routeSlug && isManualSave) {
        clearDraft()
        currentRouteSlugRef.current = result.post.slug
        router.replace(`/dashboard/posts/${result.post.slug}/edit`)
        return
      }

      if (didRouteSlugChange) {
        currentRouteSlugRef.current = result.post.slug
        router.replace(`/dashboard/posts/${result.post.slug}/edit`)
      }
    },
    [clearDraft, draftId, initialId, router],
  )

  const executeSave = useCallback(
    async (input: SavePostInput) => {
      const [validationErr, validatedInput] = validateSavePostInput(input)
      if (validationErr) {
        handlePostError(validationErr)
        if (
          validationErr.reason === 'TITLE_REQUIRED' ||
          validationErr.reason === 'SLUG_REQUIRED' ||
          validationErr.reason === 'INVALID_SLUG_FORMAT' ||
          (validationErr.reason === 'VALIDATION_ERROR' &&
            (validationErr.field === 'canonicalUrl' || validationErr.field === 'coverImageAlt'))
        ) {
          openMetadataInspector()
        }
        return
      }

      const hadPostId = Boolean(postId)
      setIsSaving(true)

      try {
        const [saveErr, result] = await savePostAction(validatedInput)
        if (saveErr) {
          handlePostError(saveErr)
          if (
            saveErr.reason === 'DUPLICATE_POST_SLUG' ||
            saveErr.reason === 'TITLE_REQUIRED' ||
            saveErr.reason === 'SLUG_REQUIRED' ||
            saveErr.reason === 'INVALID_SLUG_FORMAT'
          ) {
            openMetadataInspector()
          }
          return
        }

        sileo.success({
          title: hadPostId ? t('notifications.post_updated') : t('notifications.post_created'),
        })

        syncSavedPostResult(result, frontmatter, true)
      } finally {
        setIsSaving(false)
      }
    },
    [frontmatter, handlePostError, openMetadataInspector, postId, syncSavedPostResult, t],
  )

  const executeAutoSave = useCallback(
    async (input: SavePostInput) => {
      const [validationErr, validatedInput] = validateSavePostInput(input)
      if (validationErr) return

      setIsAutoSaving(true)
      try {
        const [saveErr, result] = await savePostAction(validatedInput)
        if (saveErr) return

        syncSavedPostResult(result, frontmatter, false)
      } finally {
        setIsAutoSaving(false)
      }
    },
    [frontmatter, syncSavedPostResult],
  )

  // 15-Second Auto-Save Timer for in-progress draft edits
  useEffect(() => {
    if (!draftLastSaved) return
    if (lastSyncedTimestampRef.current && draftLastSaved <= lastSyncedTimestampRef.current) return
    if (!frontmatter.title.trim() || !frontmatter.slug.trim()) return

    const timer = window.setTimeout(() => {
      const latestContent =
        useBlogDraftsStore.getState().drafts[draftId]?.content ?? initialContent ?? ''
      lastSyncedTimestampRef.current = draftLastSaved
      void executeAutoSave({
        id: postId,
        title: frontmatter.title,
        slug: frontmatter.slug,
        description: frontmatter.description,
        locale: frontmatter.locale,
        translationGroupId: frontmatter.translationGroupId || undefined,
        published: frontmatter.published,
        draft: true,
        intent: 'auto_save',
        categories: frontmatter.categories,
        content: latestContent,
        coverImage: frontmatter.coverImage || null,
        coverImageAlt: frontmatter.coverImageAlt || null,
        canonicalUrl: frontmatter.canonicalUrl || null,
      })
    }, AUTO_SAVE_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [draftId, draftLastSaved, executeAutoSave, frontmatter, initialContent, postId])

  const handleToggleMetadata = useCallback(() => {
    if (isMobile) {
      setHasOpenedMetadataSheet(true)
      setIsMetadataSheetOpen((prev) => !prev)
      return
    }

    const panel = metadataPanelRef.current
    if (!panel) return

    if (panel.isCollapsed()) {
      panel.expand()
    } else {
      panel.collapse()
    }
  }, [isMobile, metadataPanelRef])

  const handlePublish = useCallback(() => {
    const latestContent =
      useBlogDraftsStore.getState().drafts[draftId]?.content ?? initialContent ?? ''

    void executeSave({
      id: postId,
      title: frontmatter.title,
      slug: frontmatter.slug,
      description: frontmatter.description,
      locale: frontmatter.locale,
      translationGroupId: frontmatter.translationGroupId || undefined,
      published: true,
      draft: false,
      intent: 'publish',
      categories: frontmatter.categories,
      content: latestContent,
      coverImage: frontmatter.coverImage || null,
      coverImageAlt: frontmatter.coverImageAlt || null,
      canonicalUrl: frontmatter.canonicalUrl || null,
    })
  }, [draftId, executeSave, frontmatter, initialContent, postId])

  const handleTogglePublish = useCallback(
    (nextPublished: boolean) => {
      if (!postId) {
        blogDraftsActions.setFrontmatter(draftId, {
          ...frontmatter,
          published: nextPublished,
          draft: !nextPublished ? true : frontmatter.draft,
        })
        return
      }

      const latestContent =
        useBlogDraftsStore.getState().drafts[draftId]?.content ?? initialContent ?? ''

      void executeSave({
        id: postId,
        title: frontmatter.title,
        slug: frontmatter.slug,
        description: frontmatter.description,
        locale: frontmatter.locale,
        translationGroupId: frontmatter.translationGroupId || undefined,
        published: nextPublished,
        draft: !nextPublished,
        intent: nextPublished ? 'publish' : 'unpublish',
        categories: frontmatter.categories,
        content: latestContent,
        coverImage: frontmatter.coverImage || null,
        coverImageAlt: frontmatter.coverImageAlt || null,
        canonicalUrl: frontmatter.canonicalUrl || null,
      })
    },
    [draftId, executeSave, frontmatter, initialContent, postId],
  )

  const handleDiscardDraft = useCallback(async () => {
    if (!postId) return

    setIsDiscardingDraft(true)
    try {
      const [discardErr, result] = await discardDraftChangesAction({ postId })
      if (discardErr) {
        handlePostError(discardErr)
        return
      }

      const restoredFrontmatter: BlogFrontmatter = {
        ...frontmatter,
        published: result.published,
        draft: false,
      }
      blogDraftsActions.resetDraft(draftId, restoredFrontmatter, result.content)
      lastSyncedTimestampRef.current = Date.now()
      setServerUpdatedAt(result.updatedAt)
      setServerLastEditor(result.lastEditorName)
      setEditorResetKey((prev) => prev + 1)
      sileo.success({ title: t('notifications.draft_discarded') })
    } finally {
      setIsDiscardingDraft(false)
    }
  }, [draftId, frontmatter, handlePostError, postId, t])

  const { upload: uploadInlineImage } = useImageUpload({ context: 'inline' })

  const handleImageUpload = useCallback(
    async (file: File) => {
      sileo.info({ title: t('notifications.uploading_image') })
      const url = await uploadInlineImage(file)
      if (url) {
        sileo.success({ title: t('notifications.image_inserted') })
        return url
      }
      return undefined
    },
    [t, uploadInlineImage],
  )

  const handleContentChange = useCallback(
    (markdown: string) => {
      blogDraftsActions.setContent(draftId, markdown)
    },
    [draftId],
  )

  const handleFrontmatterChange = useCallback(
    (newFrontmatter: BlogFrontmatter) => {
      blogDraftsActions.setFrontmatter(draftId, newFrontmatter)
    },
    [draftId],
  )

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      const currentGeneratedSlug = generateSlug(frontmatter.title).replace(/^-+|-+$/g, '')
      // Once a post has been created in the DB (`Boolean(postId)`), typing in the Header Title input
      // ONLY updates `title` and never silently mutates `slug`.
      const shouldAutoSyncSlug =
        !postId && (!frontmatter.slug || frontmatter.slug === currentGeneratedSlug)

      handleFrontmatterChange({
        ...frontmatter,
        title: newTitle,
        slug: shouldAutoSyncSlug
          ? generateSlug(newTitle).replace(/^-+|-+$/g, '')
          : frontmatter.slug,
        draft: true,
      })
    },
    [frontmatter, handleFrontmatterChange, postId],
  )

  const handleTogglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev)
  }, [])

  const editorDisplayName =
    serverLastEditor || authorName || currentUserName || t('header.default_author')
  const previewAuthorName = authorName || currentUserName || t('header.default_author')
  const previewAuthorImage = authorImage ?? currentUserImage ?? null
  const previewAuthorEmailVerified = authorEmailVerified ?? currentUserEmailVerified ?? false
  const lastUpdatedAt = draftLastSaved || serverUpdatedAt || null
  const isExistingPost = Boolean(postId)
  const initialEditorContent = initialContent || ''

  const editorHeaderBaseProps = {
    title: frontmatter.title,
    onTitleChange: handleTitleChange,
    published: frontmatter.published,
    draft: frontmatter.draft,
    lastUpdatedAt,
    editorDisplayName,
    isSaving,
    isAutoSaving,
    isPreviewMode,
    onPublish: handlePublish,
    onPreview: handleTogglePreview,
    onToggleMetadata: handleToggleMetadata,
  }

  const metadataFormProps = {
    data: frontmatter,
    onChange: handleFrontmatterChange,
    existingCategories,
    isExistingPost,
    onTogglePublish: handleTogglePublish,
    onDiscardDraft: postId ? handleDiscardDraft : undefined,
    isDiscardingDraft,
  }

  const editorWorkspace = (
    <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
      <div
        className={cn(
          'flex-1 min-h-0 w-full flex p-3 md:p-4 justify-center overflow-hidden',
          isPreviewMode && 'hidden',
        )}
      >
        {isHydrated ? (
          <Editor
            key={`${draftId}-${editorResetKey}`}
            draftId={draftId}
            initialContent={initialEditorContent}
            onChange={handleContentChange}
            onImageUpload={handleImageUpload}
          />
        ) : (
          <EditorLoader text={tEditor('loading')} />
        )}
      </div>
      {isPreviewMode && (
        <DynamicBlogPostPreview
          draftId={draftId}
          frontmatter={frontmatter}
          fallbackContent={initialEditorContent}
          authorName={previewAuthorName}
          authorImage={previewAuthorImage}
          authorEmailVerified={previewAuthorEmailVerified}
          viewsCount={viewsCount}
          updatedAt={lastUpdatedAt}
        />
      )}
    </div>
  )

  // Mobile Layout (< 768px): Full-width editor + Slide-over Sheet
  if (isMobile) {
    return (
      <div
        data-slot="blog-composer"
        className="flex-1 min-h-0 w-full flex flex-col overflow-hidden"
      >
        <EditorHeader {...editorHeaderBaseProps} isMetadataOpen={isMetadataSheetOpen} />

        {editorWorkspace}

        {(hasOpenedMetadataSheet || isMetadataSheetOpen) && (
          <DynamicPostMetadataSheet
            open={isMetadataSheetOpen}
            onOpenChange={(nextOpen) => {
              if (nextOpen) setHasOpenedMetadataSheet(true)
              setIsMetadataSheetOpen(nextOpen)
            }}
            {...metadataFormProps}
          />
        )}
      </div>
    )
  }

  // Tablet & Desktop Layout (>= 768px): Split Resizable Studio Layout
  return (
    <div data-slot="blog-composer" className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Panel: Main Editor Area */}
        <ResizablePanel
          defaultSize={72}
          minSize={50}
          className="flex h-full min-h-0 flex-col overflow-hidden"
        >
          <EditorHeader {...editorHeaderBaseProps} isMetadataOpen={!isRightPanelCollapsed} />

          {editorWorkspace}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel: Collapsible Metadata Inspector */}
        <ResizablePanel
          panelRef={metadataPanelRef}
          defaultSize={28}
          minSize={22}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onResize={(panelSize) => {
            setIsRightPanelCollapsed(panelSize.asPercentage === 0)
          }}
          className="h-full min-h-0 overflow-hidden"
        >
          <aside className="flex h-full min-h-0 w-full flex-col bg-secondary-background/50 overflow-hidden">
            <div className="bg-secondary-background px-5 py-3.5 border-b border-border flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Settings2 className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-heading text-sm font-semibold text-foreground truncate">
                    {t('frontmatter.title')}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {t('frontmatter.sheet_description')}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => metadataPanelRef.current?.collapse()}
                aria-label="Collapse metadata panel"
              >
                <X className="size-3.5" />
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
              <PostMetadataForm idPrefix="post-metadata-panel" {...metadataFormProps} />
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
