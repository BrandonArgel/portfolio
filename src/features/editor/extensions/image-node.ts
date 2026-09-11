import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageComponent } from '../components/image'
import { MDX_REGEX } from '../config/regex'

export const ImageNode = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
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
})
