import { InputRule } from '@tiptap/core'
import Image, { type ImageOptions } from '@tiptap/extension-image'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { IMAGE_INPUT_RULE } from '@/lib/markdown-regex'
import { ImageComponent } from '../components/image'

interface CustomImageOptions extends ImageOptions {
  uploadFn?: (file: File) => Promise<string | undefined>
}

function findNodeByUploadId(
  doc: ProsemirrorNode,
  uploadId: string,
): { pos: number; node: ProsemirrorNode } | null {
  let result: { pos: number; node: ProsemirrorNode } | null = null

  doc.descendants((node, pos) => {
    if (node.attrs.uploadId === uploadId) {
      result = { pos, node }
      return false
    }
    return undefined
  })

  return result
}

function handleAsyncUpload(
  view: EditorView,
  uploadId: string,
  file: File,
  uploadFn: (file: File) => Promise<string | undefined>,
) {
  uploadFn(file)
    .then((url) => {
      const target = findNodeByUploadId(view.state.doc, uploadId)
      if (!target) {
        return
      }

      if (url) {
        const tr = view.state.tr.setNodeMarkup(target.pos, undefined, {
          ...target.node.attrs,
          src: url,
          alt: target.node.attrs.alt || file.name.replace(/\.[^/.]+$/, ''),
          isUploading: false,
          uploadId: null,
        })
        view.dispatch(tr)
      } else {
        const tr = view.state.tr.delete(target.pos, target.pos + target.node.nodeSize)
        view.dispatch(tr)
      }
    })
    .catch(() => {
      const target = findNodeByUploadId(view.state.doc, uploadId)
      if (target) {
        const tr = view.state.tr.delete(target.pos, target.pos + target.node.nodeSize)
        view.dispatch(tr)
      }
    })
}

export const ImageNode = Image.extend<CustomImageOptions>({
  name: 'image',

  addOptions(): CustomImageOptions {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      resize: false,
      ...this.parent?.(),
      uploadFn: undefined,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: '' },
      alt: { default: '' },
      title: { default: '' },
      isUploading: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-uploading') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.isUploading) return {}
          return { 'data-uploading': 'true' }
        },
      },
      uploadId: {
        default: null,
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent, {
      stopEvent: ({ event }) => {
        const target = event.target
        if (!(target instanceof HTMLElement)) {
          return false
        }
        return Boolean(
          target.closest('input, button, [role="toolbar"], [role="tablist"], [data-image-toolbar]'),
        )
      },
    })
  },

  addInputRules() {
    return [
      new InputRule({
        find: IMAGE_INPUT_RULE,
        handler: ({ state, range, match }) => {
          const [, fullImage = '', alt = '', src = '', title = ''] = match
          if (!fullImage || !src) return null

          const { tr } = state
          const start = range.from + match[0].lastIndexOf(fullImage)
          const end = range.to
          const imageNode = this.type.create({ src, alt, title })
          const $start = state.doc.resolve(start)

          // When the image syntax spans the entire paragraph, replace the paragraph itself
          // so we don't leave a stray empty paragraph above a block image node.
          if (
            this.type.isBlock &&
            $start.depth > 0 &&
            $start.parent.type.name === 'paragraph' &&
            start === $start.start() &&
            end === $start.end() &&
            $start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), this.type)
          ) {
            tr.replaceWith($start.before(), $start.after(), imageNode)
          } else {
            tr.replaceWith(start, end, imageNode)
          }

          tr.scrollIntoView()
        },
      }),
    ]
  },

  addProseMirrorPlugins() {
    const uploadFn = this.options.uploadFn

    return [
      new Plugin({
        key: new PluginKey('imageUploadPlugin'),
        props: {
          handlePaste: (view: EditorView, event: ClipboardEvent) => {
            if (!uploadFn || !event.clipboardData) {
              return false
            }

            const files = Array.from(event.clipboardData.files || [])
            const imageFile = files.find((file) => file.type.startsWith('image/'))
            if (!imageFile) {
              return false
            }

            event.preventDefault()

            const imageType = view.state.schema.nodes.image
            if (!imageType) {
              return false
            }

            const uploadId =
              typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now() + Math.random())

            const node = imageType.create({
              src: '',
              alt: imageFile.name.replace(/\.[^/.]+$/, ''),
              isUploading: true,
              uploadId,
            })

            const tr = view.state.tr.replaceSelectionWith(node)
            view.dispatch(tr)

            handleAsyncUpload(view, uploadId, imageFile, uploadFn)
            return true
          },

          handleDrop: (view: EditorView, event: DragEvent) => {
            if (!uploadFn || !event.dataTransfer) {
              return false
            }

            const files = Array.from(event.dataTransfer.files || [])
            const imageFile = files.find((file) => file.type.startsWith('image/'))
            if (!imageFile) {
              return false
            }

            event.preventDefault()

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })

            if (!coordinates) {
              return false
            }

            const imageType = view.state.schema.nodes.image
            if (!imageType) {
              return false
            }

            const uploadId =
              typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now() + Math.random())

            const node = imageType.create({
              src: '',
              alt: imageFile.name.replace(/\.[^/.]+$/, ''),
              isUploading: true,
              uploadId,
            })

            const tr = view.state.tr.insert(coordinates.pos, node)
            view.dispatch(tr)

            handleAsyncUpload(view, uploadId, imageFile, uploadFn)
            return true
          },

          handleDOMEvents: {
            dragover: (_view: EditorView, event: DragEvent) => {
              if (event.dataTransfer?.types?.includes('Files')) {
                event.preventDefault()
                return true
              }
              return false
            },
          },
        },
      }),
    ]
  },
})
