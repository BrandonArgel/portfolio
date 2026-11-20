import type { JSONContent } from '@tiptap/core'

import { type CalloutType, DEFAULT_CALLOUT_TYPE, getCalloutLabel } from '@/lib/markdown-regex'

export function createCalloutContent(type: CalloutType = DEFAULT_CALLOUT_TYPE): JSONContent {
  return {
    type: 'callout',
    attrs: {
      type,
    },
    content: [
      {
        type: 'calloutTitle',
        content: [{ type: 'text', text: getCalloutLabel(type) }],
      },
      {
        type: 'paragraph',
      },
    ],
  }
}
