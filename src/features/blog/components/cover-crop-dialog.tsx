'use client'

import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  COVER_THUMBNAIL_HEIGHT,
  COVER_THUMBNAIL_WIDTH,
  type CoverCropRect,
  clampCoverPanOffset,
  computeCoverCropRectFromViewport,
} from '../utils/optimize-cover-image'

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.05

export interface CoverCropDialogProps {
  file: File
  naturalWidth: number
  naturalHeight: number
  onCancel: () => void
  onConfirm: (cropRect: CoverCropRect) => void
  isSubmitting?: boolean
}

export function CoverCropDialog({
  file,
  naturalWidth,
  naturalHeight,
  onCancel,
  onConfirm,
  isSubmitting = false,
}: CoverCropDialogProps) {
  const t = useTranslations('features.blog.composer.cover_crop')

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const dragStartRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const viewportRef = useCallback((node: HTMLElement | null) => {
    if (!node) return

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      // Prefer clientWidth/clientHeight so DialogContent's `zoom-in-95` enter transform
      // does not lock the crop viewport at 95% of its layout dimensions.
      const width = node.clientWidth || rect.width
      const height = node.clientHeight || rect.height
      if (width > 0 && height > 0) {
        setViewportSize((prev) =>
          prev.width === width && prev.height === height ? prev : { width, height },
        )
      }
    }

    updateSize()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateSize)
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  const viewportWidth = viewportSize.width || COVER_THUMBNAIL_WIDTH
  const viewportHeight = viewportSize.height || COVER_THUMBNAIL_HEIGHT
  const isViewportReady = viewportSize.width > 0 && viewportSize.height > 0 && previewUrl !== null

  const clampedOffset = clampCoverPanOffset(offset.x, offset.y, {
    naturalWidth,
    naturalHeight,
    viewportWidth,
    viewportHeight,
    zoom,
  })

  const baseScale = Math.max(viewportWidth / naturalWidth, viewportHeight / naturalHeight)
  const displayScale = baseScale * zoom
  const renderedWidth = naturalWidth * displayScale
  const renderedHeight = naturalHeight * displayScale
  const imgLeft = (viewportWidth - renderedWidth) / 2 + clampedOffset.x
  const imgTop = (viewportHeight - renderedHeight) / 2 + clampedOffset.y

  const updateZoom = (nextZoomValue: number) => {
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoomValue.toFixed(2))))
    setZoom(clampedZoom)
    setOffset((prev) =>
      clampCoverPanOffset(prev.x, prev.y, {
        naturalWidth,
        naturalHeight,
        viewportWidth,
        viewportHeight,
        zoom: clampedZoom,
      }),
    )
  }

  const handleReset = () => {
    setZoom(MIN_ZOOM)
    setOffset({ x: 0, y: 0 })
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: clampedOffset.x,
      originY: clampedOffset.y,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragStartRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    setOffset(
      clampCoverPanOffset(
        drag.originX + (e.clientX - drag.startX),
        drag.originY + (e.clientY - drag.startY),
        {
          naturalWidth,
          naturalHeight,
          viewportWidth,
          viewportHeight,
          zoom,
        },
      ),
    )
  }

  const stopDragging = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragStartRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragStartRef.current = null
    setIsDragging(false)
  }

  const handleConfirm = () => {
    const cropRect = computeCoverCropRectFromViewport({
      naturalWidth,
      naturalHeight,
      viewportWidth,
      viewportHeight,
      zoom,
      offsetX: clampedOffset.x,
      offsetY: clampedOffset.y,
    })
    onConfirm(cropRect)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isSubmitting && onCancel()}>
      <DialogContent className="sm:max-w-xl" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section
            ref={viewportRef}
            aria-label={t('viewport_aria_label')}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            className={cn(
              'relative aspect-[1200/630] w-full overflow-hidden rounded-xl border border-border bg-black/90 touch-none select-none',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
          >
            {previewUrl && (
              // biome-ignore lint/performance/noImgElement: Interactive blob URL preview inside canvas cropper
              <img
                src={previewUrl}
                alt={t('title')}
                draggable={false}
                className={cn(
                  'pointer-events-none absolute top-0 left-0 max-w-none max-h-none select-none transition-opacity duration-150',
                  isViewportReady ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                  width: `${renderedWidth}px`,
                  height: `${renderedHeight}px`,
                  transform: `translate3d(${imgLeft}px, ${imgTop}px, 0)`,
                }}
              />
            )}

            {/* Rule-of-thirds visual crop frame overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
            >
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>
          </section>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => updateZoom(zoom - ZOOM_STEP * 2)}
              disabled={zoom <= MIN_ZOOM || isSubmitting}
              aria-label={t('zoom_out')}
            >
              <ZoomOut className="size-4" />
            </Button>

            <Slider
              value={zoom}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              onValueChange={(nextZoom) => updateZoom(nextZoom)}
              ariaLabel={t('zoom_label')}
              disabled={isSubmitting}
              className="flex-1"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => updateZoom(zoom + ZOOM_STEP * 2)}
              disabled={zoom >= MAX_ZOOM || isSubmitting}
              aria-label={t('zoom_in')}
            >
              <ZoomIn className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={
                isSubmitting ||
                (zoom === MIN_ZOOM && clampedOffset.x === 0 && clampedOffset.y === 0)
              }
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{t('reset')}</span>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!isViewportReady || isSubmitting}>
            {isSubmitting && <Spinner className="mr-1.5 size-4 animate-spin" />}
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
