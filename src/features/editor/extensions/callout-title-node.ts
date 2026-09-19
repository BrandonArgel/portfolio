import { mergeAttributes, Node } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

/**
 * CalloutTitleNode — an inline-content child node of `callout`.
 *
 * Schema: `content: 'inline*'`, rendered as `<div data-type="callout-title">`.
 * The node is `defining` so that its content is treated as the textual
 * representation of the node when copying / pasting.
 *
 * Keyboard behaviour:
 * - **Enter** inside the title creates a new paragraph *below* the title
 *   but still inside the parent callout, then moves the cursor there.
 * - **Backspace** at position 0 of an empty title is a no-op to avoid
 *   accidentally destroying the structural title node.
 */
export const CalloutTitleNode = Node.create({
  name: 'calloutTitle',

  group: 'block',

  content: 'inline*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout-title"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'callout-title' }, HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      /**
       * Enter inside calloutTitle → insert a paragraph right after the title
       * node (but still inside the parent callout) and move the cursor there.
       */
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection

        // Only handle if we are inside a calloutTitle
        if ($from.parent.type.name !== this.name) {
          return false
        }

        // Find the depth of the calloutTitle node
        const titleDepth = $from.depth
        // The position right after the end of the calloutTitle node
        const after = $from.after(titleDepth)

        const paragraphType = editor.state.schema.nodes.paragraph
        if (!paragraphType) {
          return false
        }

        const tr = editor.state.tr.insert(after, paragraphType.create())
        // Place cursor inside the new paragraph (+1 to enter the node)
        tr.setSelection(TextSelection.create(tr.doc, after + 1))
        editor.view.dispatch(tr)
        return true
      },

      /**
       * Backspace at the very start of the calloutTitle → prevent deletion
       * so we don't accidentally destroy the structural title node.
       */
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection

        if ($from.parent.type.name !== this.name) {
          return false
        }

        // Only intercept if cursor is at the start of the title
        if (!empty || $from.parentOffset !== 0) {
          return false
        }

        // Block the keypress — do nothing
        return true
      },
    }
  },

  /**
   * The calloutTitle is serialized by its parent callout node.
   * We render just the raw inline text so the parent can place it
   * on the `> [!TYPE] ` line.
   */
  renderMarkdown: (node, helpers) => {
    if (!node.content || node.content.length === 0) {
      return ''
    }
    return helpers.renderChildren(node)
  },
})
