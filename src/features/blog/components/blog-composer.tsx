'use client'

import { Settings2, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  usePanelRef,
} from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { Editor } from '@/features/editor/components/editor'
import { EditorLoader } from '@/features/editor/components/editor-loader'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@/lib/utils'
import { useBlogComposer } from '../hooks/use-blog-composer'
import type { BlogFrontmatter } from '../schemas/post-schema'
import { EditorHeader } from './editor-header'
import { PostMetadataForm, type PostMetadataFormProps } from './post-metadata-form'

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

function useComposerLayoutState() {
  const isMobile = useIsMobile()
  const metadataPanelRef = usePanelRef()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isMetadataSheetOpen, setIsMetadataSheetOpen] = useState(false)
  const [hasOpenedMetadataSheet, setHasOpenedMetadataSheet] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)

  const openMetadataInspector = () => {
    if (isMobile) {
      setHasOpenedMetadataSheet(true)
      setIsMetadataSheetOpen(true)
    } else if (metadataPanelRef.current?.isCollapsed()) {
      metadataPanelRef.current.expand()
    }
  }

  const handleToggleMetadata = () => {
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
  }

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setHasOpenedMetadataSheet(true)
    setIsMetadataSheetOpen(nextOpen)
  }

  const collapseDesktopPanel = () => {
    metadataPanelRef.current?.collapse()
  }

  const togglePreview = () => {
    setIsPreviewMode((prev) => !prev)
  }

  return {
    isMobile,
    metadataPanelRef,
    isPreviewMode,
    togglePreview,
    isMetadataOpen: isMobile ? isMetadataSheetOpen : !isRightPanelCollapsed,
    shouldMountSheet: hasOpenedMetadataSheet || isMetadataSheetOpen,
    isMetadataSheetOpen,
    setIsRightPanelCollapsed,
    openMetadataInspector,
    handleToggleMetadata,
    handleSheetOpenChange,
    collapseDesktopPanel,
  }
}

interface BlogComposerWorkspaceProps {
  draftId: string
  editorResetKey: number
  isHydrated: boolean
  isPreviewMode: boolean
  initialEditorContent: string
  frontmatter: BlogFrontmatter
  previewAuthorName: string
  previewAuthorImage: string | null
  previewAuthorEmailVerified: boolean
  viewsCount?: number
  lastUpdatedAt: string | Date | number | null
  onContentChange: (markdown: string) => void
  onImageUpload: (file: File) => Promise<string | undefined>
}

function BlogComposerWorkspace({
  draftId,
  editorResetKey,
  isHydrated,
  isPreviewMode,
  initialEditorContent,
  frontmatter,
  previewAuthorName,
  previewAuthorImage,
  previewAuthorEmailVerified,
  viewsCount = 0,
  lastUpdatedAt,
  onContentChange,
  onImageUpload,
}: BlogComposerWorkspaceProps) {
  const tEditor = useTranslations('features.editor')

  return (
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
            onChange={onContentChange}
            onImageUpload={onImageUpload}
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
}

interface DesktopMetadataSidebarProps {
  title: string
  description: string
  onCollapse: () => void
  metadataFormProps: Omit<PostMetadataFormProps, 'idPrefix' | 'className'>
}

function DesktopMetadataSidebar({
  title,
  description,
  onCollapse,
  metadataFormProps,
}: DesktopMetadataSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-secondary-background/50 overflow-hidden">
      <div className="bg-secondary-background px-5 py-3.5 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Settings2 className="size-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-semibold text-foreground truncate">{title}</h2>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onCollapse}
          aria-label="Collapse metadata panel"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
        <PostMetadataForm idPrefix="post-metadata-panel" {...metadataFormProps} />
      </div>
    </aside>
  )
}

interface MobileComposerLayoutProps {
  header: ReactNode
  workspace: ReactNode
  shouldMountSheet: boolean
  isSheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
  metadataFormProps: Omit<PostMetadataFormProps, 'idPrefix' | 'className'>
}

function MobileComposerLayout({
  header,
  workspace,
  shouldMountSheet,
  isSheetOpen,
  onSheetOpenChange,
  metadataFormProps,
}: MobileComposerLayoutProps) {
  return (
    <div data-slot="blog-composer" className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
      {header}
      {workspace}
      {shouldMountSheet && (
        <DynamicPostMetadataSheet
          open={isSheetOpen}
          onOpenChange={onSheetOpenChange}
          {...metadataFormProps}
        />
      )}
    </div>
  )
}

interface DesktopComposerLayoutProps {
  header: ReactNode
  workspace: ReactNode
  metadataPanelRef: ReturnType<typeof usePanelRef>
  sidebarTitle: string
  sidebarDescription: string
  onPanelResize: (collapsed: boolean) => void
  onCollapsePanel: () => void
  metadataFormProps: Omit<PostMetadataFormProps, 'idPrefix' | 'className'>
}

function DesktopComposerLayout({
  header,
  workspace,
  metadataPanelRef,
  sidebarTitle,
  sidebarDescription,
  onPanelResize,
  onCollapsePanel,
  metadataFormProps,
}: DesktopComposerLayoutProps) {
  return (
    <div data-slot="blog-composer" className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 w-full overflow-hidden">
        <ResizablePanel
          defaultSize={72}
          minSize={50}
          className="flex h-full min-h-0 flex-col overflow-hidden"
        >
          {header}
          {workspace}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          panelRef={metadataPanelRef}
          defaultSize={28}
          minSize={22}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onResize={(panelSize) => onPanelResize(panelSize.asPercentage === 0)}
          className="h-full min-h-0 overflow-hidden"
        >
          <DesktopMetadataSidebar
            title={sidebarTitle}
            description={sidebarDescription}
            onCollapse={onCollapsePanel}
            metadataFormProps={metadataFormProps}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export function BlogComposer(props: BlogComposerProps) {
  const t = useTranslations('features.blog.composer')
  const layout = useComposerLayoutState()

  const composer = useBlogComposer({
    ...props,
    onOpenMetadataInspector: layout.openMetadataInspector,
  })

  const headerNode = (
    <EditorHeader
      title={composer.frontmatter.title}
      onTitleChange={composer.handleTitleChange}
      published={composer.frontmatter.published}
      draft={composer.frontmatter.draft}
      lastUpdatedAt={composer.lastUpdatedAt}
      editorDisplayName={composer.editorDisplayName}
      isSaving={composer.isSaving}
      isAutoSaving={composer.isAutoSaving}
      isMetadataOpen={layout.isMetadataOpen}
      isPreviewMode={layout.isPreviewMode}
      onPublish={composer.handlePublish}
      onPreview={layout.togglePreview}
      onToggleMetadata={layout.handleToggleMetadata}
    />
  )

  const metadataFormProps: Omit<PostMetadataFormProps, 'idPrefix' | 'className'> = {
    data: composer.frontmatter,
    onChange: composer.handleFrontmatterChange,
    existingCategories: props.existingCategories,
    isExistingPost: composer.isExistingPost,
    onTogglePublish: composer.handleTogglePublish,
    onDiscardDraft: composer.handleDiscardDraft,
    isDiscardingDraft: composer.isDiscardingDraft,
  }

  const workspaceNode = (
    <BlogComposerWorkspace
      draftId={composer.draftId}
      editorResetKey={composer.editorResetKey}
      isHydrated={composer.isHydrated}
      isPreviewMode={layout.isPreviewMode}
      initialEditorContent={composer.initialEditorContent}
      frontmatter={composer.frontmatter}
      previewAuthorName={composer.previewAuthorName}
      previewAuthorImage={composer.previewAuthorImage}
      previewAuthorEmailVerified={composer.previewAuthorEmailVerified}
      viewsCount={props.viewsCount}
      lastUpdatedAt={composer.lastUpdatedAt}
      onContentChange={composer.handleContentChange}
      onImageUpload={composer.handleImageUpload}
    />
  )

  if (layout.isMobile) {
    return (
      <MobileComposerLayout
        header={headerNode}
        workspace={workspaceNode}
        shouldMountSheet={layout.shouldMountSheet}
        isSheetOpen={layout.isMetadataSheetOpen}
        onSheetOpenChange={layout.handleSheetOpenChange}
        metadataFormProps={metadataFormProps}
      />
    )
  }

  return (
    <DesktopComposerLayout
      header={headerNode}
      workspace={workspaceNode}
      metadataPanelRef={layout.metadataPanelRef}
      sidebarTitle={t('frontmatter.title')}
      sidebarDescription={t('frontmatter.sheet_description')}
      onPanelResize={layout.setIsRightPanelCollapsed}
      onCollapsePanel={layout.collapseDesktopPanel}
      metadataFormProps={metadataFormProps}
    />
  )
}
