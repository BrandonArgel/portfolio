'use client'

import { Settings2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from '@/components/ui/resizable'
import { discardDraftChangesAction, savePostAction } from '@/features/blog/actions/post-actions'
import { Editor } from '@/features/editor/components/editor'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { generateSlug } from '@/utils/string-utils'
import { useImageUpload } from '../hooks/use-image-upload'
import { type BlogFrontmatter, defaultFrontmatter } from '../schemas/post.schema'
import { blogDraftsActions, useBlogDraftsStore } from '../store/use-blog-drafts-store'
import { BlogPostPreview } from './blog-post-preview'
import { EditorHeader } from './editor-header'
import { PostMetadataForm } from './post-metadata-form'
import { PostMetadataSheet } from './post-metadata-sheet'

const AUTO_SAVE_INTERVAL_MS = 15_000

export interface BlogComposerProps {
  initialId?: string
  initialFrontmatter?: BlogFrontmatter
  initialContent?: string
  existingCategories?: string[]
  initialUpdatedAt?: string | Date | null
  authorName?: string | null
  lastEditorName?: string | null
  currentUserName?: string | null
}

export function BlogComposer({
  initialId,
  initialFrontmatter,
  initialContent,
  existingCategories,
  initialUpdatedAt,
  authorName,
  lastEditorName,
  currentUserName,
}: BlogComposerProps) {
  const t = useTranslations('features.blog.composer')
  const router = useRouter()
  const isMobile = useIsMobile()
  const metadataPanelRef = usePanelRef()

  const draftId = initialId || 'new'
  const [postId, setPostId] = useState<string | undefined>(initialId)
  const [isMetadataSheetOpen, setIsMetadataSheetOpen] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | Date | null | undefined>(
    initialUpdatedAt,
  )
  const [serverLastEditor, setServerLastEditor] = useState<string | null | undefined>(
    lastEditorName,
  )
  const [editorResetKey, setEditorResetKey] = useState(0)

  const isHydrated = useStoreHydration(useBlogDraftsStore)
  const draft = useBlogDraftsStore((state) => state.drafts[draftId])

  useEffect(() => {
    if (isHydrated && !draft) {
      blogDraftsActions.initDraft(draftId, initialFrontmatter, initialContent)
    }
  }, [isHydrated, draft, draftId, initialFrontmatter, initialContent])

  const frontmatter = draft?.frontmatter || initialFrontmatter || defaultFrontmatter
  const content = draft?.content ?? (initialContent || '')

  const lastSyncedTimestampRef = useRef<number | null>(null)

  const clearDraft = useCallback(() => {
    blogDraftsActions.clearDraft(draftId)
  }, [draftId])

  // Manual Publish / Update / Unpublish Action
  const { execute: executeSave, isExecuting: isSaving } = useAction(savePostAction, {
    onSuccess: (res) => {
      if (!res.data?.success) {
        return
      }

      setPostId(res.data.postId)
      setServerUpdatedAt(res.data.updatedAt)
      setServerLastEditor(res.data.lastEditorName)

      const updatedFrontmatter: BlogFrontmatter = {
        ...frontmatter,
        published: res.data.published,
        draft: res.data.draft,
      }
      blogDraftsActions.setFrontmatter(draftId, updatedFrontmatter)
      lastSyncedTimestampRef.current = Date.now()

      sileo.success({
        title: postId ? t('notifications.post_updated') : t('notifications.post_created'),
      })

      if (!initialId && res.data.slug) {
        clearDraft()
        router.push(`/dashboard/posts/${res.data.slug}/edit`)
      }
    },
    onError: ({ error }) => {
      sileo.error({
        title: t('notifications.save_error'),
        description: error.serverError?.description,
      })
    },
  })

  // Silent 15-second DB Auto-Save Action
  const { execute: executeAutoSave, isExecuting: isAutoSaving } = useAction(savePostAction, {
    onSuccess: (res) => {
      if (!res.data?.success) return
      setPostId(res.data.postId)
      setServerUpdatedAt(res.data.updatedAt)
      setServerLastEditor(res.data.lastEditorName)
    },
  })

  // Discard Unpublished Draft Changes Action
  const { execute: executeDiscardDraft, isExecuting: isDiscardingDraft } = useAction(
    discardDraftChangesAction,
    {
      onSuccess: (res) => {
        if (!res.data?.success) return
        const restoredFrontmatter: BlogFrontmatter = {
          ...frontmatter,
          published: res.data.published,
          draft: false,
        }
        blogDraftsActions.resetDraft(draftId, restoredFrontmatter, res.data.content)
        lastSyncedTimestampRef.current = Date.now()
        setServerUpdatedAt(res.data.updatedAt)
        setServerLastEditor(res.data.lastEditorName)
        setEditorResetKey((prev) => prev + 1)
        sileo.success({ title: t('notifications.draft_discarded') })
      },
      onError: ({ error }) => {
        sileo.error({
          title: t('notifications.save_error'),
          description: error.serverError?.description,
        })
      },
    },
  )

  // 15-Second Auto-Save Timer for in-progress draft edits
  useEffect(() => {
    const lastSaved = draft?.lastSaved
    if (!lastSaved) return
    if (lastSyncedTimestampRef.current && lastSaved <= lastSyncedTimestampRef.current) return
    if (!frontmatter.title.trim() || !frontmatter.slug.trim()) return

    const timer = window.setTimeout(() => {
      lastSyncedTimestampRef.current = lastSaved
      executeAutoSave({
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
        content,
        coverImage: frontmatter.coverImage || null,
      })
    }, AUTO_SAVE_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [content, draft?.lastSaved, executeAutoSave, frontmatter, postId])

  const openMetadataInspector = useCallback(() => {
    if (isMobile) {
      setIsMetadataSheetOpen(true)
    } else if (metadataPanelRef.current?.isCollapsed()) {
      metadataPanelRef.current.expand()
    }
  }, [isMobile, metadataPanelRef])

  const handleToggleMetadata = useCallback(() => {
    if (isMobile) {
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
    if (!frontmatter.title.trim() || !frontmatter.slug.trim()) {
      sileo.error({ title: t('notifications.title_slug_required') })
      openMetadataInspector()
      return
    }

    executeSave({
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
      content,
      coverImage: frontmatter.coverImage || null,
    })
  }, [content, executeSave, frontmatter, openMetadataInspector, postId, t])

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

      if (!frontmatter.title.trim() || !frontmatter.slug.trim()) {
        sileo.error({ title: t('notifications.title_slug_required') })
        return
      }

      executeSave({
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
        content,
        coverImage: frontmatter.coverImage || null,
      })
    },
    [content, draftId, executeSave, frontmatter, postId, t],
  )

  const handleDiscardDraft = useCallback(() => {
    if (!postId) return
    executeDiscardDraft({ postId })
  }, [executeDiscardDraft, postId])

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
      const currentGeneratedSlug = generateSlug(frontmatter.title)
      const shouldUpdateSlug = !frontmatter.slug || frontmatter.slug === currentGeneratedSlug

      handleFrontmatterChange({
        ...frontmatter,
        title: newTitle,
        slug: shouldUpdateSlug ? generateSlug(newTitle) : frontmatter.slug,
        draft: true,
      })
    },
    [frontmatter, handleFrontmatterChange],
  )

  const handleTogglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev)
  }, [])

  const editorDisplayName =
    serverLastEditor || authorName || currentUserName || t('header.default_author')
  const lastUpdatedAt = draft?.lastSaved || serverUpdatedAt || null

  // Mobile Layout (< 768px): Full-width editor + Slide-over Sheet
  if (isMobile) {
    return (
      <div className="h-[calc(100dvh-3.5rem)] w-full flex flex-col overflow-hidden">
        <EditorHeader
          title={frontmatter.title}
          onTitleChange={handleTitleChange}
          published={frontmatter.published}
          draft={frontmatter.draft}
          lastUpdatedAt={lastUpdatedAt}
          editorDisplayName={editorDisplayName}
          isSaving={isSaving}
          isAutoSaving={isAutoSaving}
          isMetadataOpen={isMetadataSheetOpen}
          isPreviewMode={isPreviewMode}
          onPublish={handlePublish}
          onPreview={handleTogglePreview}
          onToggleMetadata={handleToggleMetadata}
        />

        <div className="flex-1 min-h-0 w-full p-3 flex justify-center overflow-hidden">
          <div className={cn('h-full w-full flex justify-center', isPreviewMode && 'hidden')}>
            <Editor
              key={`${draftId}-${editorResetKey}`}
              draftId={draftId}
              initialContent={content}
              onChange={handleContentChange}
              onImageUpload={handleImageUpload}
            />
          </div>
          {isPreviewMode && (
            <BlogPostPreview
              frontmatter={frontmatter}
              content={content}
              authorName={editorDisplayName}
              updatedAt={lastUpdatedAt}
            />
          )}
        </div>

        <PostMetadataSheet
          open={isMetadataSheetOpen}
          onOpenChange={setIsMetadataSheetOpen}
          data={frontmatter}
          onChange={handleFrontmatterChange}
          existingCategories={existingCategories}
          onTogglePublish={handleTogglePublish}
          onDiscardDraft={postId ? handleDiscardDraft : undefined}
          isDiscardingDraft={isDiscardingDraft}
        />
      </div>
    )
  }

  // Tablet & Desktop Layout (>= 768px): Split Resizable Studio Layout
  return (
    <div className="h-dvh w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        {/* Left Panel: Main Editor Area */}
        <ResizablePanel
          defaultSize={72}
          minSize={50}
          className="flex h-full flex-col overflow-hidden"
        >
          <EditorHeader
            title={frontmatter.title}
            onTitleChange={handleTitleChange}
            published={frontmatter.published}
            draft={frontmatter.draft}
            lastUpdatedAt={lastUpdatedAt}
            editorDisplayName={editorDisplayName}
            isSaving={isSaving}
            isAutoSaving={isAutoSaving}
            isMetadataOpen={!isRightPanelCollapsed}
            isPreviewMode={isPreviewMode}
            onPublish={handlePublish}
            onPreview={handleTogglePreview}
            onToggleMetadata={handleToggleMetadata}
          />

          <div className="flex-1 min-h-0 w-full p-4 flex justify-center overflow-hidden">
            <div className={cn('h-full w-full flex justify-center', isPreviewMode && 'hidden')}>
              <Editor
                key={`${draftId}-${editorResetKey}`}
                draftId={draftId}
                initialContent={content}
                onChange={handleContentChange}
                onImageUpload={handleImageUpload}
              />
            </div>
            {isPreviewMode && (
              <BlogPostPreview
                frontmatter={frontmatter}
                content={content}
                authorName={editorDisplayName}
                updatedAt={lastUpdatedAt}
              />
            )}
          </div>
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
          className="h-full overflow-hidden"
        >
          <aside className="flex h-full w-full flex-col bg-secondary-background/50 overflow-hidden">
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
              <PostMetadataForm
                idPrefix="post-metadata-panel"
                data={frontmatter}
                onChange={handleFrontmatterChange}
                existingCategories={existingCategories}
                onTogglePublish={handleTogglePublish}
                onDiscardDraft={postId ? handleDiscardDraft : undefined}
                isDiscardingDraft={isDiscardingDraft}
              />
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
