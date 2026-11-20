import React from 'react'

/** Recursively extracts plain text from a React node tree. */
export function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }
  if (
    React.isValidElement(node) &&
    node.props &&
    typeof node.props === 'object' &&
    'children' in node.props
  ) {
    return extractText((node.props as { children?: React.ReactNode }).children)
  }
  return ''
}
