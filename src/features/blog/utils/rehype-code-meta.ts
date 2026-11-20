interface HastNode {
  type?: string
  tagName?: string
  properties?: Record<string, unknown>
  data?: Record<string, unknown>
  children?: HastNode[]
}

function walkAndForwardMeta(node: HastNode) {
  if (!Array.isArray(node.children)) return

  if (node.type === 'element' && node.tagName === 'pre') {
    const codeChild = node.children.find(
      (child) => child.type === 'element' && child.tagName === 'code',
    )
    const meta = codeChild?.data?.meta

    if (typeof meta === 'string' && meta.trim()) {
      node.properties = {
        ...node.properties,
        'data-meta': meta,
      }
      if (codeChild) {
        codeChild.properties = {
          ...codeChild.properties,
          'data-meta': meta,
        }
      }
    }
    return
  }

  for (const child of node.children) {
    walkAndForwardMeta(child)
  }
}

/**
 * Forwards fenced code block metadata (`code.data.meta`) onto HAST `<pre data-meta="...">`
 * so `next-mdx-remote` custom `pre` components receive fence annotations (`title`, `highlight`, etc.).
 */
export function rehypeCodeMeta() {
  return function transformer(tree: HastNode) {
    walkAndForwardMeta(tree)
  }
}
