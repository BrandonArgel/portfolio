'use client'

import type { Components } from 'react-markdown' // Importamos el tipo exacto
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { cn } from '@/lib/utils'
import { sharedMdxComponents } from './shared/mdx-components'
import { sharedRehypePlugins, sharedRemarkPlugins } from './shared/mdx-plugins'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const processedContent = content.replace(/<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\/>/g, '<$1 $2></$1>')

  return (
    <div className={cn('typeset typeset-docs w-full max-w-none wrap-break-word', className)}>
      <ReactMarkdown
        remarkPlugins={sharedRemarkPlugins}
        rehypePlugins={[rehypeRaw, ...sharedRehypePlugins]}
        components={sharedMdxComponents as Components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
