import React from 'react'
import { MDX_REGEX } from '@/features/blog/config/regex'

export function stripCalloutPrefix(node: React.ReactNode): React.ReactNode {
  let stripped = false

  function traverse(n: React.ReactNode): React.ReactNode {
    if (stripped) return n
    if (typeof n === 'string') {
      const match = MDX_REGEX.calloutPrefix.exec(n)
      if (match) {
        stripped = true
        return n.slice(match[0].length)
      }
      return n
    }
    if (React.isValidElement(n)) {
      const element = n as React.ReactElement<{ children?: React.ReactNode }>
      const children = React.Children.map(element.props.children, traverse)
      return React.cloneElement(element, element.props, children)
    }
    if (Array.isArray(n)) return React.Children.map(n, traverse)
    return n
  }
  return traverse(node)
}
