'use client'

import { useTranslations } from 'next-intl'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { sileo } from 'sileo'
import { discardDraftChangesAction, savePostAction } from '@/features/blog/actions/post-actions'
import { useStoreHydration } from '@/hooks/use-store-hydration'
import { useRouter } from '@/i18n/navigation'
import {
  type BlogFrontmatter,
  defaultFrontmatter,
  type SavePostInput,
  validateSavePostInput,
} from '../schemas/post-schema'
import type { SavePostResult } from '../services/posts-mutation-service'
import { blogDraftsActions, useBlogDraftsStore } from '../store/use-blog-drafts-store'
import type { PostError } from '../types/errors'
import {
  applyTitleChangeToFrontmatter,
  buildSavePostInput,
  mergeSavedResultIntoFrontmatter,
  shouldOpenMetadataOnPostError,
} from '../utils/blog-composer-utils'
import { useImageUpload } from './use-image-upload'
import { usePostErrors } from './use-post-errors'

const AUTO_SAVE_INTERVAL_MS = 15_000

interface UseBlogComposerOptions {
  initialId?: string
  initialFrontmatter?: BlogFrontmatter
  initialContent?: string
  initialUpdatedAt?: string | Date | null
  authorName?: string | null
  authorImage?: string | null
  authorEmailVerified?: boolean
  lastEditorName?: string | null
  currentUserName?: string | null
  currentUserImage?: string | null
  currentUserEmailVerified?: boolean
  onOpenMetadataInspector: () => void
}

function getLatestDraftContent(draftId: string, initialContent?: string): string {
  return useBlogDraftsStore.getState().drafts[draftId]?.content ?? initialContent ?? ''
}

function firstNonEmpty(values: Array<string | null | undefined>, fallback: string): string {
  return values.find((value): value is string => Boolean(value)) ?? fallback
}

function resolveSavedPostNavigation({
  result,
  initialId,
  currentRouteSlug,
  isManualSave,
}: {
  result: SavePostResult
  initialId?: string
  currentRouteSlug?: string
  isManualSave: boolean
}): { nextSlug: string; shouldClearDraft: boolean } | null {
  if (!initialId && !currentRouteSlug && isManualSave) {
    return { nextSlug: result.post.slug, shouldClearDraft: true }
  }

  if (result.slugChanged || (Boolean(currentRouteSlug) && result.post.slug !== currentRouteSlug)) {
    return { nextSlug: result.post.slug, shouldClearDraft: false }
  }

  return null
}

function resolveAuthorDisplayValues({
  serverLastEditor,
  authorName,
  currentUserName,
  authorImage,
  currentUserImage,
  authorEmailVerified,
  currentUserEmailVerified,
  defaultAuthor,
}: {
  serverLastEditor?: string | null
  authorName?: string | null
  currentUserName?: string | null
  authorImage?: string | null
  currentUserImage?: string | null
  authorEmailVerified?: boolean
  currentUserEmailVerified?: boolean
  defaultAuthor: string
}) {
  return {
    editorDisplayName: firstNonEmpty(
      [serverLastEditor, authorName, currentUserName],
      defaultAuthor,
    ),
    previewAuthorName: firstNonEmpty([authorName, currentUserName], defaultAuthor),
    previewAuthorImage: authorImage ?? currentUserImage ?? null,
    previewAuthorEmailVerified: authorEmailVerified ?? currentUserEmailVerified ?? false,
  }
}

interface UseDraftStoreStateParams {
  draftId: string
  initialFrontmatter?: BlogFrontmatter
  initialContent?: string
}

function useDraftStoreState({
  draftId,
  initialFrontmatter,
  initialContent,
}: UseDraftStoreStateParams) {
  const isHydrated = useStoreHydration(useBlogDraftsStore)
  const draftFrontmatter = useBlogDraftsStore((state) => state.drafts[draftId]?.frontmatter)
  const draftLastSaved = useBlogDraftsStore((state) => state.drafts[draftId]?.lastSaved ?? null)
  const hasDraft = useBlogDraftsStore((state) => Boolean(state.drafts[draftId]))

  useEffect(() => {
    if (isHydrated && !hasDraft) {
      blogDraftsActions.initDraft(draftId, initialFrontmatter, initialContent)
    }
  }, [isHydrated, hasDraft, draftId, initialFrontmatter, initialContent])

  return {
    isHydrated,
    frontmatter: draftFrontmatter || initialFrontmatter || defaultFrontmatter,
    draftLastSaved,
  }
}

interface UseComposerServerSyncParams {
  draftId: string
  initialId?: string
  initialSlug?: string
  initialUpdatedAt?: string | Date | null
  lastEditorName?: string | null
  lastSyncedTimestampRef: RefObject<number | null>
}

function useComposerServerSync({
  draftId,
  initialId,
  initialSlug,
  initialUpdatedAt,
  lastEditorName,
  lastSyncedTimestampRef,
}: UseComposerServerSyncParams) {
  const router = useRouter()
  const [postId, setPostId] = useState<string | undefined>(initialId)
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | Date | null | undefined>(
    initialUpdatedAt,
  )
  const [serverLastEditor, setServerLastEditor] = useState<string | null | undefined>(
    lastEditorName,
  )
  const [editorResetKey, setEditorResetKey] = useState(0)
  const currentRouteSlugRef = useRef<string | undefined>(initialId ? initialSlug : undefined)

  const syncSavedPostResult = useCallback(
    (result: SavePostResult, currentFrontmatter: BlogFrontmatter, isManualSave: boolean) => {
      setPostId(result.post.id)
      setServerUpdatedAt(result.updatedAt)
      setServerLastEditor(result.lastEditorName)

      blogDraftsActions.setFrontmatter(
        draftId,
        mergeSavedResultIntoFrontmatter(currentFrontmatter, result),
      )
      lastSyncedTimestampRef.current = Date.now()

      const navigation = resolveSavedPostNavigation({
        result,
        initialId,
        currentRouteSlug: currentRouteSlugRef.current,
        isManualSave,
      })
      if (!navigation) return

      if (navigation.shouldClearDraft) {
        blogDraftsActions.clearDraft(draftId)
      }
      currentRouteSlugRef.current = navigation.nextSlug
      router.replace(`/dashboard/posts/${navigation.nextSlug}/edit`)
    },
    [draftId, initialId, lastSyncedTimestampRef, router],
  )

  const applyDiscardedDraftMetadata = (updatedAt: string, editorName: string | null) => {
    setServerUpdatedAt(updatedAt)
    setServerLastEditor(editorName)
    setEditorResetKey((prev) => prev + 1)
  }

  return {
    postId,
    serverUpdatedAt,
    serverLastEditor,
    editorResetKey,
    syncSavedPostResult,
    applyDiscardedDraftMetadata,
  }
}

interface UseDraftAutoSaveParams {
  draftId: string
  postId?: string
  draftLastSaved: number | null
  frontmatter: BlogFrontmatter
  initialContent?: string
  lastSyncedTimestampRef: RefObject<number | null>
  syncSavedPostResult: (
    result: SavePostResult,
    currentFrontmatter: BlogFrontmatter,
    isManualSave: boolean,
  ) => void
}

function useDraftAutoSave({
  draftId,
  postId,
  draftLastSaved,
  frontmatter,
  initialContent,
  lastSyncedTimestampRef,
  syncSavedPostResult,
}: UseDraftAutoSaveParams): boolean {
  const [isAutoSaving, setIsAutoSaving] = useState(false)

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

  useEffect(() => {
    if (!draftLastSaved) return
    if (lastSyncedTimestampRef.current && draftLastSaved <= lastSyncedTimestampRef.current) return
    if (!frontmatter.title.trim() || !frontmatter.slug.trim()) return

    const timer = window.setTimeout(() => {
      const latestContent = getLatestDraftContent(draftId, initialContent)
      lastSyncedTimestampRef.current = draftLastSaved
      void executeAutoSave(
        buildSavePostInput({
          postId,
          frontmatter,
          content: latestContent,
          published: frontmatter.published,
          draft: true,
          intent: 'auto_save',
        }),
      )
    }, AUTO_SAVE_INTERVAL_MS)

    return () => window.clearTimeout(timer)
  }, [
    draftId,
    draftLastSaved,
    executeAutoSave,
    frontmatter,
    initialContent,
    lastSyncedTimestampRef,
    postId,
  ])

  return isAutoSaving
}

interface UsePostSaveActionsParams {
  draftId: string
  postId?: string
  frontmatter: BlogFrontmatter
  initialContent?: string
  updatedNotification: string
  createdNotification: string
  handlePostError: (err: PostError) => void
  onOpenMetadataInspector: () => void
  syncSavedPostResult: (
    result: SavePostResult,
    currentFrontmatter: BlogFrontmatter,
    isManualSave: boolean,
  ) => void
}

function usePostSaveActions({
  draftId,
  postId,
  frontmatter,
  initialContent,
  updatedNotification,
  createdNotification,
  handlePostError,
  onOpenMetadataInspector,
  syncSavedPostResult,
}: UsePostSaveActionsParams) {
  const [isSaving, setIsSaving] = useState(false)

  const reportSaveError = (err: PostError) => {
    handlePostError(err)
    if (shouldOpenMetadataOnPostError(err)) {
      onOpenMetadataInspector()
    }
  }

  const executeSave = async (input: SavePostInput) => {
    const [validationErr, validatedInput] = validateSavePostInput(input)
    if (validationErr) {
      reportSaveError(validationErr)
      return
    }

    const hadPostId = Boolean(postId)
    setIsSaving(true)

    try {
      const [saveErr, result] = await savePostAction(validatedInput)
      if (saveErr) {
        reportSaveError(saveErr)
        return
      }

      sileo.success({
        title: hadPostId ? updatedNotification : createdNotification,
      })
      syncSavedPostResult(result, frontmatter, true)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = () => {
    void executeSave(
      buildSavePostInput({
        postId,
        frontmatter,
        content: getLatestDraftContent(draftId, initialContent),
        published: true,
        draft: false,
        intent: 'publish',
      }),
    )
  }

  const handleTogglePublish = (nextPublished: boolean) => {
    if (!postId) {
      blogDraftsActions.setFrontmatter(draftId, {
        ...frontmatter,
        published: nextPublished,
        draft: !nextPublished ? true : frontmatter.draft,
      })
      return
    }

    void executeSave(
      buildSavePostInput({
        postId,
        frontmatter,
        content: getLatestDraftContent(draftId, initialContent),
        published: nextPublished,
        draft: !nextPublished,
        intent: nextPublished ? 'publish' : 'unpublish',
      }),
    )
  }

  return { isSaving, handlePublish, handleTogglePublish }
}

interface UseDiscardDraftActionParams {
  draftId: string
  postId?: string
  frontmatter: BlogFrontmatter
  lastSyncedTimestampRef: RefObject<number | null>
  discardedNotification: string
  handlePostError: (err: PostError) => void
  onDiscarded: (updatedAt: string, lastEditorName: string | null) => void
}

function useDiscardDraftAction({
  draftId,
  postId,
  frontmatter,
  lastSyncedTimestampRef,
  discardedNotification,
  handlePostError,
  onDiscarded,
}: UseDiscardDraftActionParams) {
  const [isDiscardingDraft, setIsDiscardingDraft] = useState(false)

  const handleDiscardDraft = async () => {
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
      onDiscarded(result.updatedAt, result.lastEditorName)
      sileo.success({ title: discardedNotification })
    } finally {
      setIsDiscardingDraft(false)
    }
  }

  return {
    isDiscardingDraft,
    handleDiscardDraft: postId ? handleDiscardDraft : undefined,
  }
}

/**
 * Coordinates blog composer draft persistence, granular Zustand subscriptions, auto-saving,
 * publishing/unpublishing, draft discarding, and inline image uploads.
 */
export function useBlogComposer(options: UseBlogComposerOptions) {
  const t = useTranslations('features.blog.composer')
  const { handlePostError } = usePostErrors()
  const { upload: uploadInlineImage } = useImageUpload({ context: 'inline' })

  const draftId = options.initialId || 'new'
  const lastSyncedTimestampRef = useRef<number | null>(null)

  const storeState = useDraftStoreState({
    draftId,
    initialFrontmatter: options.initialFrontmatter,
    initialContent: options.initialContent,
  })

  const serverSync = useComposerServerSync({
    draftId,
    initialId: options.initialId,
    initialSlug: options.initialFrontmatter?.slug,
    initialUpdatedAt: options.initialUpdatedAt,
    lastEditorName: options.lastEditorName,
    lastSyncedTimestampRef,
  })

  const isAutoSaving = useDraftAutoSave({
    draftId,
    postId: serverSync.postId,
    draftLastSaved: storeState.draftLastSaved,
    frontmatter: storeState.frontmatter,
    initialContent: options.initialContent,
    lastSyncedTimestampRef,
    syncSavedPostResult: serverSync.syncSavedPostResult,
  })

  const saveActions = usePostSaveActions({
    draftId,
    postId: serverSync.postId,
    frontmatter: storeState.frontmatter,
    initialContent: options.initialContent,
    updatedNotification: t('notifications.post_updated'),
    createdNotification: t('notifications.post_created'),
    handlePostError,
    onOpenMetadataInspector: options.onOpenMetadataInspector,
    syncSavedPostResult: serverSync.syncSavedPostResult,
  })

  const discardAction = useDiscardDraftAction({
    draftId,
    postId: serverSync.postId,
    frontmatter: storeState.frontmatter,
    lastSyncedTimestampRef,
    discardedNotification: t('notifications.draft_discarded'),
    handlePostError,
    onDiscarded: serverSync.applyDiscardedDraftMetadata,
  })

  const handleImageUpload = async (file: File) => {
    sileo.info({ title: t('notifications.uploading_image') })
    const url = await uploadInlineImage(file)
    if (!url) return undefined

    sileo.success({ title: t('notifications.image_inserted') })
    return url
  }

  const handleContentChange = (markdown: string) => {
    blogDraftsActions.setContent(draftId, markdown)
  }

  const handleFrontmatterChange = (newFrontmatter: BlogFrontmatter) => {
    blogDraftsActions.setFrontmatter(draftId, newFrontmatter)
  }

  const handleTitleChange = (newTitle: string) => {
    handleFrontmatterChange(
      applyTitleChangeToFrontmatter(storeState.frontmatter, newTitle, Boolean(serverSync.postId)),
    )
  }

  const authorDisplay = resolveAuthorDisplayValues({
    serverLastEditor: serverSync.serverLastEditor,
    authorName: options.authorName,
    currentUserName: options.currentUserName,
    authorImage: options.authorImage,
    currentUserImage: options.currentUserImage,
    authorEmailVerified: options.authorEmailVerified,
    currentUserEmailVerified: options.currentUserEmailVerified,
    defaultAuthor: t('header.default_author'),
  })

  return {
    draftId,
    frontmatter: storeState.frontmatter,
    isHydrated: storeState.isHydrated,
    isSaving: saveActions.isSaving,
    isAutoSaving,
    isDiscardingDraft: discardAction.isDiscardingDraft,
    isExistingPost: Boolean(serverSync.postId),
    editorResetKey: serverSync.editorResetKey,
    lastUpdatedAt: storeState.draftLastSaved ?? serverSync.serverUpdatedAt ?? null,
    initialEditorContent: options.initialContent ?? '',
    ...authorDisplay,
    handleTitleChange,
    handleContentChange,
    handleFrontmatterChange,
    handlePublish: saveActions.handlePublish,
    handleTogglePublish: saveActions.handleTogglePublish,
    handleDiscardDraft: discardAction.handleDiscardDraft,
    handleImageUpload,
  }
}
