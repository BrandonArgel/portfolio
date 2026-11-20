import { markInputRule, markPasteRule } from '@tiptap/core'
import Underline from '@tiptap/extension-underline'

import { UNDERLINE_INPUT_RULE, UNDERLINE_PASTE_RULE } from '@/lib/markdown-regex'

export const UnderlineMark = Underline.extend({
  addInputRules() {
    return [
      markInputRule({
        find: UNDERLINE_INPUT_RULE,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: UNDERLINE_PASTE_RULE,
        type: this.type,
      }),
    ]
  },
})
