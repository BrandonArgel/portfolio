import type { JSONContent } from '@tiptap/core'

export const CALLOUT_TYPES = [
  'tip',
  'info',
  'pencil',
  'quote',
  'success',
  'warning',
  'failure',
  'danger',
  'bug',
  'example',
] as const

export type CalloutType = (typeof CALLOUT_TYPES)[number]

export const DEFAULT_CALLOUT_TYPE: CalloutType = 'info'

export function isCalloutType(value: string): value is CalloutType {
  return CALLOUT_TYPES.includes(value as CalloutType)
}

export function getCalloutTitle(type: CalloutType): string {
  return type.toUpperCase()
}

export function createCalloutContent(type: CalloutType = DEFAULT_CALLOUT_TYPE): JSONContent {
  return {
    type: 'callout',
    attrs: {
      type,
      title: getCalloutTitle(type),
    },
    content: [
      {
        type: 'paragraph',
      },
    ],
  }
}
