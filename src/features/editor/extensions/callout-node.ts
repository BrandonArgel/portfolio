import { mergeAttributes, Node, textblockTypeInputRule } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CalloutComponent } from '../components/callout'
import { MDX_REGEX } from '../config/regex'

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      type: { default: 'info' },
      title: { default: 'INFO' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent)
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: MDX_REGEX.calloutPrefix,
        type: this.type,
        getAttributes: (match: any) => {
          const type = match[1].toLowerCase()
          return {
            type: type,
            title: type.toUpperCase(),
          }
        },
      }),
    ]
  },
  addKeyboardShortcuts() {
    return {
      ArrowUp: ({ editor }) => {
        if (!editor.isActive('callout')) return false

        if (editor.view.endOfTextblock('up')) {
          const { $head } = editor.state.selection
          const calloutPos = $head.before($head.depth)
          const dom = editor.view.nodeDOM(calloutPos) as HTMLElement
          if (dom) {
            const input = dom.querySelector('input')
            if (input) {
              editor.commands.blur()
              setTimeout(() => input.focus(), 10)
              return true
            }
          }
        }
        return false
      },
      ArrowLeft: ({ editor }) => {
        if (!editor.isActive('callout')) return false
        const { $head, empty } = editor.state.selection
        if (!empty) return false

        const calloutPos = $head.before($head.depth)
        if ($head.pos === calloutPos + 1) {
          const dom = editor.view.nodeDOM(calloutPos) as HTMLElement
          if (dom) {
            const input = dom.querySelector('input')
            if (input) {
              editor.commands.blur()
              setTimeout(() => input.focus(), 10)
              return true
            }
          }
        }
        return false
      },
      ArrowDown: ({ editor }) => {
        if (editor.view.endOfTextblock('down')) {
          const { $head } = editor.state.selection
          const nextNodePos = $head.after($head.depth)
          const nextNode = editor.state.doc.nodeAt(nextNodePos)

          if (nextNode && nextNode.type.name === 'callout') {
            const dom = editor.view.nodeDOM(nextNodePos) as HTMLElement
            if (dom) {
              const input = dom.querySelector('input')
              if (input) {
                editor.commands.blur()
                setTimeout(() => input.focus(), 10)
                return true
              }
            }
          }
        }
        return false
      },
      ArrowRight: ({ editor }) => {
        if (editor.view.endOfTextblock('right') || editor.view.endOfTextblock('forward')) {
          const { $head } = editor.state.selection
          const nextNodePos = $head.after($head.depth)
          const nextNode = editor.state.doc.nodeAt(nextNodePos)

          if (nextNode && nextNode.type.name === 'callout') {
            const dom = editor.view.nodeDOM(nextNodePos) as HTMLElement
            if (dom) {
              const input = dom.querySelector('input')
              if (input) {
                editor.commands.blur()
                setTimeout(() => input.focus(), 10)
                return true
              }
            }
          }
        }
        return false
      },
      Tab: ({ editor }) => {
        const { $head } = editor.state.selection

        const nextNodePos = $head.after($head.depth)
        const nextNode = editor.state.doc.nodeAt(nextNodePos)

        if (nextNode && nextNode.type.name === 'callout') {
          const dom = editor.view.nodeDOM(nextNodePos) as HTMLElement
          if (dom) {
            const input = dom.querySelector('input')
            if (input) {
              editor.commands.blur()
              setTimeout(() => input.focus(), 10)
              return true
            }
          }
        }

        return false
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('callout')) {
          const { $head } = editor.state.selection
          const calloutPos = $head.before($head.depth)
          const dom = editor.view.nodeDOM(calloutPos) as HTMLElement

          if (dom) {
            const input = dom.querySelector('input')
            if (input) {
              editor.commands.blur()
              setTimeout(() => input.focus(), 10)
              return true
            }
          }
          return false
        }

        const { $head } = editor.state.selection

        const posBeforeBlock = $head.before($head.depth)

        const tr = editor.state.tr
        const resolvedPos = tr.doc.resolve(posBeforeBlock)

        const prevSelection = TextSelection.findFrom(resolvedPos, -1, true)

        if (prevSelection) {
          const parent = tr.doc.resolve(prevSelection.from).parent
          if (parent.type.name === 'callout') {
            editor.view.dispatch(tr.setSelection(prevSelection))
            editor.view.focus()
            return true
          }
        }

        return false
      },
    }
  },
})
