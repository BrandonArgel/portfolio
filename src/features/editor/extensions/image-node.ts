import { nodeInputRule } from '@tiptap/core'
import Image, { type ImageOptions } from '@tiptap/extension-image'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ImageComponent } from '../components/image'
import { MDX_REGEX } from '../config/regex'

export interface CustomImageOptions extends ImageOptions {
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
    return ReactNodeViewRenderer(ImageComponent)
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: MDX_REGEX.imagePrefix,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match
          return { src, alt, title }
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
