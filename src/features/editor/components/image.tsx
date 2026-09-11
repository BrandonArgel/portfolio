'use client'

import { NodeViewWrapper } from '@tiptap/react'
import { useTranslations } from 'next-intl'

export const ImageComponent = (props: any) => {
  const t = useTranslations('features.editor')
  const { src, alt } = props.node.attrs
  const isSelected = props.selected

  const stopInputPropagation = (e: React.KeyboardEvent | React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <NodeViewWrapper className="my-6" data-drag-handle>
      {isSelected ? (
        <div className="font-mono text-sm bg-muted/40 p-3 rounded-md border border-border text-muted-foreground flex items-center flex-wrap gap-x-1 shadow-inner transition-all">
          <span className="text-primary/70 font-bold">![</span>

          <input
            type="text"
            value={alt || ''}
            onChange={(e) => props.updateAttributes({ alt: e.target.value })}
            onKeyDown={stopInputPropagation}
            onMouseDown={stopInputPropagation}
            placeholder={t('image_alt_placeholder')}
            className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 min-w-20 w-auto border-b border-dashed border-muted-foreground/30 focus:border-primary transition-colors"
          />

          <span className="text-primary/70 font-bold">](</span>

          <input
            type="text"
            value={src || ''}
            onChange={(e) => props.updateAttributes({ src: e.target.value })}
            onKeyDown={stopInputPropagation}
            onMouseDown={stopInputPropagation}
            placeholder="https://..."
            className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 flex-1 min-w-50 border-b border-dashed border-muted-foreground/30 focus:border-primary transition-colors truncate"
          />

          <span className="text-primary/70 font-bold">)</span>
        </div>
      ) : (
        // biome-ignore lint/performance/noImgElement: This is a custom image component for the editor
        <img
          src={src}
          alt={alt}
          className="rounded-lg max-w-full border border-border shadow-sm transition-all hover:ring-2 hover:ring-primary/40 cursor-pointer mx-auto"
        />
      )}
    </NodeViewWrapper>
  )
}
