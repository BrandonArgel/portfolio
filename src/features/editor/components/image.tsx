'use client'

import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { ImagePlus, Link, Text, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IMAGE_INPUT_ACCEPT } from '@/config/image-upload'
import { cn } from '@/lib/utils'

export function ImageComponent(props: NodeViewProps) {
  const { editor, node, selected: isSelected, updateAttributes, deleteNode } = props
  const t = useTranslations('features.editor')
  const { src, alt } = node.attrs
  const [linkUrl, setLinkUrl] = useState('')
  const [altText, setAltText] = useState(alt || '')
  const [srcText, setSrcText] = useState(src || '')
  const [localUploading, setLocalUploading] = useState(false)
  const [isToolbarFocused, setIsToolbarFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setAltText(alt || '')
    setSrcText(src || '')
  }, [alt, src])

  const isUploading = localUploading || Boolean(node.attrs.isUploading)
  const uploadFn = props.extension.options.uploadFn as
    | ((file: File) => Promise<string | undefined>)
    | undefined

  const stopInputPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }

  const handleClickUpload = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadFn) return

    setLocalUploading(true)
    try {
      const url = await uploadFn(file)
      if (url) {
        updateAttributes({
          src: url,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isUploading: false,
        })
      }
    } finally {
      setLocalUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      updateAttributes({
        src: linkUrl.trim(),
        alt: 'Embedded image',
      })
    }
  }

  const handleAltCommit = () => {
    if (altText !== alt) {
      updateAttributes({ alt: altText })
    }
  }

  const handleSrcCommit = () => {
    const trimmed = srcText.trim()
    if (trimmed && trimmed !== src) {
      updateAttributes({ src: trimmed })
    } else if (!trimmed) {
      setSrcText(src || '')
    }
  }

  const showToolbar = editor.isEditable && (isSelected || isToolbarFocused)

  // State 1: Empty src -> Tabs (Upload / Embed Link)
  if (!src) {
    return (
      <NodeViewWrapper
        className="not-typeset not-prose my-6 relative group"
        data-type="image"
        data-drag-handle
      >
        <Tabs
          defaultValue="upload"
          className="w-full relative border border-border rounded-xl shadow-sm bg-background p-2"
        >
          <button
            type="button"
            onClick={(e) => {
              stopInputPropagation(e)
              deleteNode()
            }}
            onKeyDown={stopInputPropagation}
            onMouseDown={stopInputPropagation}
            className="absolute top-2 right-2 z-10 flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            aria-label="Delete image"
          >
            <Trash2 className="size-4" />
          </button>

          <TabsList
            variant="line"
            className="w-full justify-start border-b border-border/50 rounded-none pb-0 mb-4 px-2 pr-10"
          >
            <TabsTrigger value="upload">{t('image_tab_upload')}</TabsTrigger>
            <TabsTrigger value="link">{t('image_tab_link')}</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="outline-none">
            <button
              onClick={handleClickUpload}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClickUpload()
                }
              }}
              type="button"
              tabIndex={0}
              className={cn(
                'group relative w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/40',
                isSelected && 'ring-2 ring-primary/40 ring-offset-2',
                isUploading && 'pointer-events-none opacity-80',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_INPUT_ACCEPT}
                className="hidden"
                onChange={handleFileChange}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="size-8 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('image_uploading')}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                    <ImagePlus className="size-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {t('image_upload_prompt')}
                    </span>
                    <span className="text-xs text-muted-foreground">{t('image_upload_hint')}</span>
                  </div>
                </div>
              )}
            </button>
          </TabsContent>

          <TabsContent value="link" className="outline-none p-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    stopInputPropagation(e)
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleLinkSubmit()
                    }
                  }}
                  onMouseDown={stopInputPropagation}
                  placeholder={t('image_link_placeholder') || 'Paste an image URL...'}
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    stopInputPropagation(e)
                    handleLinkSubmit()
                  }}
                  onMouseDown={stopInputPropagation}
                  disabled={!linkUrl.trim()}
                  size="sm"
                >
                  {t('image_embed_button') || 'Embed'}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground px-1">
                {t('image_link_hint') || 'Works with any direct image link from the web'}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </NodeViewWrapper>
    )
  }

  // State 2 & 3: Rendered image with floating toolbar when selected
  return (
    <NodeViewWrapper
      className="not-typeset not-prose my-6 relative group flex flex-col items-center"
      data-type="image"
      data-drag-handle
    >
      <div className="relative inline-flex max-w-full justify-center">
        {/* biome-ignore lint/performance/noImgElement: Custom image component for the editor */}
        <img
          src={src}
          alt={alt || ''}
          className="block h-auto w-auto max-w-full max-h-150 object-contain rounded-lg shadow-sm transition-all cursor-pointer"
        />
      </div>

      {showToolbar && (
        <div
          role="toolbar"
          aria-label="Image actions"
          data-image-toolbar
          contentEditable={false}
          onFocusCapture={() => setIsToolbarFocused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsToolbarFocused(false)
            }
          }}
          onMouseDown={stopInputPropagation}
          onClick={stopInputPropagation}
          onKeyDown={stopInputPropagation}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-lg border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex flex-col sm:flex-row gap-1.5">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/40 rounded-md border border-border/60 focus-within:border-primary/60 focus-within:bg-background transition-colors">
              <Link className="size-3.5 text-muted-foreground shrink-0" />
              <input
                type="url"
                value={srcText}
                onChange={(e) => setSrcText(e.target.value)}
                onBlur={handleSrcCommit}
                onKeyDown={(e) => {
                  stopInputPropagation(e)
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSrcCommit()
                    editor.commands.focus()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setSrcText(src || '')
                    editor.commands.focus()
                  }
                }}
                onMouseDown={stopInputPropagation}
                placeholder={t('image_link_placeholder')}
                className="bg-transparent outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 w-36 sm:w-52 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/40 rounded-md border border-border/60 focus-within:border-primary/60 focus-within:bg-background transition-colors">
              <Text className="size-3.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                onBlur={handleAltCommit}
                onKeyDown={(e) => {
                  stopInputPropagation(e)
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAltCommit()
                    editor.commands.focus()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setAltText(alt || '')
                    editor.commands.focus()
                  }
                }}
                onMouseDown={stopInputPropagation}
                placeholder={t('image_alt_placeholder')}
                className="bg-transparent outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 w-36 sm:w-48 focus:outline-none"
              />
            </div>
          </div>

          <div className="h-4 w-px bg-border shrink-0" />

          <button
            type="button"
            onClick={(e) => {
              stopInputPropagation(e)
              deleteNode()
            }}
            onKeyDown={stopInputPropagation}
            onMouseDown={stopInputPropagation}
            className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
            aria-label="Delete image"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  )
}
