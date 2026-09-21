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

/** Checks whether a value is a supported callout type. */
export function isCalloutType(value: unknown): value is CalloutType {
  return typeof value === 'string' && CALLOUT_TYPES.includes(value as CalloutType)
}

/** Normalizes an unknown value to a supported callout type. */
export function normalizeCalloutType(value: unknown): CalloutType {
  return isCalloutType(value) ? value : DEFAULT_CALLOUT_TYPE
}

/** Returns the display label for a callout type. */
export function getCalloutLabel(type: CalloutType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export const CALLOUT_MARKER_REGEX = new RegExp(`^\\[!(${CALLOUT_TYPES.join('|')})\\]\\s*(.*)$`, 'i')

export interface CalloutAttributes {
  type: CalloutType
}

/** Creates the initial document structure for a callout. */
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
